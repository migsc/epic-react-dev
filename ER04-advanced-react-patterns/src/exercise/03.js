// Flexible Compound Components
// http://localhost:3000/isolated/exercise/03.js

import React, {useCallback, useContext} from 'react'
import {Switch} from '../switch'

const ToggleContext = React.createContext()

ToggleContext.displayName = 'ToggleContext'

function Toggle({onToggle, children}) {
  const [on, setOn] = React.useState(false)
  const toggle = () => setOn(!on)

  return (
    <ToggleContext.Provider value={{on, toggle}}>
      {children}
    </ToggleContext.Provider>
  )
}

const useToggleContext = () => {
  const context = useContext(ToggleContext)

  // if (context === undefined) {
  //   throw new Error(
  //     'useToggleContext must be called with a Toggle',
  //   )
  // }

  return context
}

function ToggleOn({children}) {
  const context = useToggleContext()

  if (context === undefined) {
    throw new Error('ToggleOn must be a nested child of Toggle component')
  }

  const {on} = context

  return on ? children : null
}

function ToggleOff({children}) {
  const context = useToggleContext()

  if (context === undefined) {
    throw new Error('ToggleOff must be a nested child of Toggle component')
  }

  const {on} = context

  return on ? null : children
}

function ToggleButton(props) {
  const context = useToggleContext()

  if (context === undefined) {
    throw new Error('ToggleButton must be a nested child of Toggle component')
  }

  const {on, toggle} = context

  return <Switch on={on} onClick={toggle} {...props} />
}

function App() {
  return (
    <div>
      <Toggle>
        <ToggleOn>The button is on</ToggleOn>
        <ToggleOff>The button is off</ToggleOff>
        <div>
          <ToggleButton />
        </div>
      </Toggle>
    </div>
  )
}

// const App = () => <ToggleButton />

export default App

/*
eslint
  no-unused-vars: "off",
*/
