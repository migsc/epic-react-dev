// simple test with ReactDOM
// http://localhost:3000/counter

import * as React from 'react'
import ReactDOM from 'react-dom'
import Counter from '../../components/counter'

// it should start at 0
// click on inc -> should go up
// click on dec -> should go down

beforeEach(() => {
  document.body.innerHTML = ''
})

test('counter increments and decrements when the buttons are clicked', () => {
  // 🐨 create a div to render your component to (💰 document.createElement)
  const container = document.createElement('div')
  document.body.append(container)
  ReactDOM.render(<Counter />, container)

  const [decrementButton, incrementButton] = container.querySelectorAll(
    'button',
  )

  const message = container.firstChild.querySelector('div')

  expect(message.textContent).toBe('Current count: 0')
  incrementButton.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      button: 0, // left click
    }),
  )
  expect(message.textContent).toBe('Current count: 1')
  decrementButton.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      button: 0,
    }),
  )
  expect(message.textContent).toBe('Current count: 0')

  container.remove()
})

/* eslint no-unused-vars:0 */
