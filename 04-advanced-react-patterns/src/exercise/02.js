// Compound Components
// http://localhost:3000/isolated/exercise/02.js

import React from 'react'
import {Switch} from '../switch'

function Toggle({children}) {
  const [on, setOn] = React.useState(false)
  const toggle = () => setOn(!on)

  return React.Children.map(children, child => {
    if (child.type === ToggleButton) {
      return React.cloneElement(child, {
        on,
        toggle,
      })
    } else if (allowedTypes.includes(child.type)) {
      return React.cloneElement(child, {
        on,
      })
    }
    // Don't pass props to DOM elements
    return child
  })
}

const ToggleOn = ({on, children}) => (on ? children : null)

const ToggleOff = ({on, children}) => (on ? null : children)

const ToggleButton = ({on, toggle}) => <Switch on={on} onClick={toggle} />

const allowedTypes = [ToggleOn, ToggleOff, ToggleButton]

function App() {
  return (
    <div>
      <Toggle>
        <h1>My toggle</h1>
        <ToggleButton />
        <ToggleOn>The button is on</ToggleOn>
        <ToggleOff>The button is off</ToggleOff>
      </Toggle>
    </div>
  )
}

export default App

/*
eslint
  no-unused-vars: "off",
*/
