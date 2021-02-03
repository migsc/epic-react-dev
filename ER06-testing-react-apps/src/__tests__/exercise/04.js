// form testing
// http://localhost:3000/login

import * as React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from '../../components/login'
import { build, fake } from '@jackfranklin/test-data-bot';

const buildLoginForm = build('Login Form', {
  fields: {
    username: fake(f => f.internet.userName()),
    password: fake(f => f.internet.password()),
  }
})

test('submitting the form calls onSubmit with username and password', () => {
  const handleSubmit = jest.fn()

  render(<Login onSubmit={handleSubmit} />)

  const usernameField = screen.getByRole('textbox', {
    name: /username/i
  })
  const passwordField = screen.getByLabelText(/password/i)
  const submitButton = screen.getByRole('button', {
    name: /submit/i
  })

  const { username, password } = buildLoginForm({ password: 'abc' })

  userEvent.type(usernameField, username)
  userEvent.type(passwordField, password)
  userEvent.click(submitButton)

  expect(handleSubmit).toHaveBeenCalledWith({
    username,
    password
  })
  expect(handleSubmit).toHaveBeenCalledTimes(1)
})

/*
eslint
  no-unused-vars: "off",
*/
