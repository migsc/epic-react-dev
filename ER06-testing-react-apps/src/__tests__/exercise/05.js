// mocking HTTP requests
// http://localhost:3000/login-submission

import * as React from 'react'
import {render, screen, waitForElementToBeRemoved} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {build, fake} from '@jackfranklin/test-data-bot'
import {rest} from 'msw'
import {setupServer} from 'msw/node'
import Login from '../../components/login-submission'

const buildLoginForm = build({
  fields: {
    username: fake(f => f.internet.userName()),
    password: fake(f => f.internet.password()),
  },
})

const server = setupServer(
  rest.post(
    'https://auth-provider.example.com/api/login',
    async (req, res, ctx) => {
      const {username} = req.body
      ctx.json({
        username,
      })
    },
  ),
)

jest.setTimeout(60 * 1000)

beforeAll(() => {
  server.listen()
})

afterAll(() => {
  server.close()
})

test(`logging in displays the user's username`, async () => {
  render(<Login />)
  const {username, password} = buildLoginForm()

  userEvent.type(screen.getByLabelText(/username/i), username)
  userEvent.type(screen.getByLabelText(/password/i), password)
  userEvent.click(screen.getByRole('button', {name: /submit/i}))

  // await waitForElementToBeRemoved(() => screen.getByLabelText(/loading/i))
  // const welcomeMessage = screen.getByText(/welcome/i)
  // expect(welcomeMessage).toHaveTextContent(`Welcome ${username}`)

  waitForElementToBeRemoved(() => screen.getByLabelText(/loading/i)).then(
    () => {
      const welcomeMessage = screen.getByText((content, element) =>
        content.startsWith('Welcome'),
      )
      expect(welcomeMessage).toHaveTextContent(`Welcome ${username}`)
    },
  )
})
