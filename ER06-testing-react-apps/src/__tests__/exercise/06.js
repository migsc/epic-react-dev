// mocking Browser APIs and modules
// http://localhost:3000/location

import * as React from 'react'
import {
  render,
  screen,
  act,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import Location from '../../examples/location'

beforeAll(() => {
  // 🐨 set window.navigator.geolocation to an object that has a getCurrentPosition mock function
  window.navigator.geolocation = {
    // We can't actually pass the actual api function here becuase remember, our env doesn't support it
    getCurrentPosition: jest.fn(),
  }
})

// 💰 I'm going to give you this handy utility function
// it allows you to create a promise that you can resolve/reject on demand.
function deferred() {
  let resolve, reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return {promise, resolve, reject}
}
// 💰 Here's an example of how you use this:
// const {promise, resolve, reject} = deferred()
// promise.then(() => {/* do something */})
// // do other setup stuff and assert on the pending state
// resolve()
// await promise
// // assert on the resolved state

test('displays the users current location', async () => {
  const fakePosition = {
    coords: {
      latitude: 52.520007,
      longitude: 13.404954,
    },
  }

  // 🐨 create a deferred promise here
  const {promise, resolve, reject} = deferred()

  // 🐨 Now we need to mock the geolocation's getCurrentPosition function
  // To mock something you need to know its API and simulate that in your mock:
  // 📜 https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition
  window.navigator.geolocation.getCurrentPosition.mockImplementation(
    (success, error, options) => {
      promise.then(() => success(fakePosition))
    },
  )

  // 🐨 now that setup is done, render the Location component itself
  // it's now going to call getCurrentPosition via useCurrentPosition.
  render(<Location />)

  // 🐨 verify the loading spinner is showing up
  expect(screen.getByLabelText(/loading/i)).toBeInTheDocument()

  await act(async () => {
    // 🐨 resolve the deferred promise
    resolve()
    // 🐨 wait for the promise to resolve
    await promise
  })

  // 🐨 verify the loading spinner is no longer in the document
  //    (💰 use queryByLabelText instead of getByLabelText)
  // first attempt expect(screen.queryByLabelText(/loading/i)).toBe(null)
  // why not use toBeInDocument?
  // ok this is what he means...
  expect(screen.queryByLabelText(/loading/i)).not.toBeInTheDocument()

  // You can't do this -v
  // await waitForElementToBeRemoved(() => screen.queryByLabelText(/loading/i))

  // 🐨 verify the latitude and longitude appear correctly
  expect(screen.getByText(/latitude/i)).toHaveTextContent(
    fakePosition.coords.latitude,
  )
  expect(screen.getByText(/longitude/i)).toHaveTextContent(
    fakePosition.coords.longitude,
  )

  // he hardcodes the labels on Latitude and Longitude. hmmm
  // i guess there's no way around it since the two are mixed up in the textContent
  // expect(screen.getByText(/latitude/i)).toHaveTextContent(
  //   `Latitude: ${fakePosition.coords.latitude}`,
  // )
  // expect(screen.getByText(/longitude/i)).toHaveTextContent(
  //   `Longitude: ${fakePosition.coords.longitude}`,
  // )
})

/*
eslint
  no-unused-vars: "off",
*/
