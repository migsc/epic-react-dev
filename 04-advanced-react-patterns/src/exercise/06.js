// Control Props
// http://localhost:3000/isolated/exercise/06.js

import React, {useEffect} from 'react'
import warning from 'warning'
import {Switch} from '../switch'

const callAll = (...fns) => (...args) => fns.forEach(fn => fn?.(...args))

const actionTypes = {
  toggle: 'toggle',
  reset: 'reset',
}

function toggleReducer(state, {type, initialState}) {
  switch (type) {
    case actionTypes.toggle: {
      return {on: !state.on}
    }
    case actionTypes.reset: {
      return initialState
    }
    default: {
      throw new Error(`Unsupported type: ${type}`)
    }
  }
}

function useControlledSwitchWarning({on}) {}

function useToggle({
  initialOn = false,
  reducer = toggleReducer,
  onChange,
  on: controlledOn = null,
  readOnly = false,
} = {}) {
  const {current: initialState} = React.useRef({on: initialOn})
  const [state, dispatch] = React.useReducer(reducer, initialState)

  const onIsControlled = controlledOn !== null && controlledOn !== undefined

  const {current: onWasControlled} = React.useRef(onIsControlled)
  const isReadonly = onIsControlled && !onChange

  const on = onIsControlled ? controlledOn : state.on

  // We should issue the same warnings for people who misuse our controlled props:

  // Passing on without onChange
  const hasOnChange = Boolean(onChange)
  React.useEffect(() => {
    warning(
      !(!hasOnChange && onIsControlled && !readOnly),
      `An \`on\` prop was provided to useToggle without an \`onChange\` handler. This will render a read-only toggle. If you want it to be mutable, use \`initialOn\`. Otherwise, set either \`onChange\` or \`readOnly\`.`,
    )
  }, [hasOnChange, onIsControlled, readOnly])

  React.useEffect(() => {
    // Passing a value for on and later passing undefined or null
    warning(
      !(onWasControlled && !onIsControlled),
      'Your Toggle component is changing from controlled to be uncontrolled. This is likely caused by the `on` changing from a defined to undefined, which should not happen. Decide between using a controlled or uncontrolled Toggle component for the lifetime of the component. ',
    )

    // Passing undefined or null for on and later passing a value
    warning(
      !(!onWasControlled && onIsControlled),
      'Your Toggle component is changing from uncontrolled to be controlled. This is likely caused by the `on` prop changing from undefined to a defined value, which should not happen. Decide between using a controlled or uncontrolled Toggle component for the lifetime of the component',
    )
  }, [onIsControlled, onWasControlled])

  // We want to call `onChange` any time we need to make a state change, but we
  // only want to call `dispatch` if `!onIsControlled` (otherwise we could get
  // unnecessary renders).
  // We make a `dispatchWithOnChange` function right here. This will:
  // 1. accept an action
  // 2. if onIsControlled is false, call dispatch with that action
  // 3. Then call `onChange` with our "suggested changes" and the action.
  const dispatchWithOnChange = action => {
    if (!onIsControlled) {
      dispatch(action)
    }

    // So how do we determine our suggested changes? What code do we have to
    // calculate the changes based on the `action` we have here? That's right!
    // The reducer! So if we pass it the current state and the action, then it
    // should return these "suggested changes!"
    // "Suggested changes" refers to: the changes we would make if we were
    // managing the state ourselves. This is similar to how a controlled <input />
    // `onChange` callback works. When your handler is called, you get an event
    // which has information about the value input that _would_ be set to if that
    // state were managed internally.
    if (onChange) {
      onChange(reducer({...state, on}, action), action)
    }
    // We pass 'on' in here because it's controlled. It's not going to be part
    // of our state unless we include it.
  }

  const toggle = () => dispatchWithOnChange({type: actionTypes.toggle})
  const reset = () =>
    dispatchWithOnChange({type: actionTypes.reset, initialState})

  function getTogglerProps({onClick, ...props} = {}) {
    return {
      'aria-pressed': on,
      onClick: callAll(onClick, toggle),
      ...props,
    }
  }

  function getResetterProps({onClick, ...props} = {}) {
    return {
      onClick: callAll(onClick, reset),
      ...props,
    }
  }

  return {
    on,
    reset,
    toggle,
    getTogglerProps,
    getResetterProps,
  }
}

function Toggle({on: controlledOn, onChange}) {
  const {on, getTogglerProps} = useToggle({on: controlledOn, onChange})
  const props = getTogglerProps({on})
  return <Switch {...props} />
}

function App() {
  const [bothOn, setBothOn] = React.useState(false)
  const [timesClicked, setTimesClicked] = React.useState(0)

  function handleToggleChange(state, action) {
    if (action.type === actionTypes.toggle && timesClicked > 4) {
      return
    }
    setBothOn(state.on)
    setTimesClicked(c => c + 1)
  }

  function handleResetClick() {
    setBothOn(false)
    setTimesClicked(0)
  }

  return (
    <div>
      <div>
        <Toggle on={bothOn} onChange={handleToggleChange} />
        <Toggle on={bothOn} onChange={handleToggleChange} />
      </div>
      {timesClicked > 4 ? (
        <div data-testid="notice">
          Whoa, you clicked too much!
          <br />
        </div>
      ) : (
        <div data-testid="click-count">Click count: {timesClicked}</div>
      )}
      <button onClick={handleResetClick}>Reset</button>
      <hr />
      <div>
        <div>Uncontrolled Toggle:</div>
        <Toggle
          onChange={(...args) =>
            console.info('Uncontrolled Toggle onChange', ...args)
          }
        />
      </div>
    </div>
  )
}

export default App
// we're adding the Toggle export for tests
export {Toggle}

/*
eslint
  no-unused-vars: "off",
*/
