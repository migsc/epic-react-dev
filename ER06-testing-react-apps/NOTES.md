Testing is about building confidence in the code you've written so that you
become more sure that making changes in one place does not affect you in
another.

- Looking at a component you want to test, think "If I was a manual tester how
  would I test this?" and make it do that.

# Simple Test with ReactDOM

Your tests should resemble the way your software is actually used.

Shallow rendering lets you render a component “one level deep” and assert facts
about what its render method returns, without worrying about the behavior of
child components, which are not instantiated or rendered. Test test

https://stackoverflow.com/questions/46881630/what-is-shallow-rendering-in-jest-unit-tests-in-react

"all shallow rendering is doing is taking the result of the given component's
render method (which will be a React element (read What is JSX?)) and giving us
a wrapper object with some utilities for traversing this JavaScript object. This
means it doesn't run lifecycle methods (because we just have the React elements
to deal with), it doesn't allow you to actually interact with DOM elements
(because nothing's actually rendered), and it doesn't actually attempt to get
the react elements that are returned by your custom components (like our Fade
component)."

when firing events programatically on elements like this for tests, you probably
wanna stick to dispatchEvent and pass an instance of a bubbling MouseEvent.

button = 0 means left click cancelable - by default setting when user clicks on
button so that's why we add it here.

a lot of event don't have a convenient method on the target like click does.
also React uses event delegation and bubbling is required in oroder for that to
work.

make sure to clean up before/after your tests using beforeEach so that tests can
run in isolation of each other.

# Simple Test with React Testing Library

React Testing library gives us a lot of benefits.

- automatic cleanup of the DOM between tests for libraries like jest that
  support the beforeEach global
- automaic unmounting of components
- utilities for rendering components to the dom, firing events, and more.

# Form Testing

Important things to test in form/user input of any kind:

  1) the user can find inputs in the form
  2) the user can fill in their information
  3) when they submit the form the submitted data is correct.

always inspect elements first to see how they are parsed in the accessibility view

you can also paste your code into https://testing-playground.com/ to traverse it

it's good practice to use getByRole or getByLabelText for most elements. Password inputs actually don't have a predefined role for security purposes though.

if you want to be clean, you could just select text boxes by label text and given you are doing some stuff after such as typing into them and submitting a form, it shouldn't be too much of a problem because your test would fail correctly if you weren't able to select that box correctly.

remember to DRY (don't repeat yourself) with form values as it also helps with communicating in the test that you are testing submitted data against what you typed.

# Mock Functions

Mock functions are also known as "spies", because they let you spy on the behavior of a function that is called indirectly by some other code, rather than only testing the output. You can create a mock function with jest.fn(). If no implementation is given, the mock function will return undefined when invoked.

you can do things like pass a function/callback and ask if it was called.

you could also ensure that a mock function is called with the right arguments

generate usernames and passwords to 1) communicate that the values themselves don't actually matter and 2) to get more confidence in testing a wider sets of values that can bypass special logic.

use faker!


when generating values this way, it's important to also allow overrides if 1) you don't want to generate large data or 2) you want to test a special case

There's a library I like to use for generating test data:
[`@jackfranklin/test-data-bot`](https://www.npmjs.com/package/@jackfranklin/test-data-bot). 

This library is great because it comes with faker already and a clean way to create "build" functions that provide your fields

these are also called object factories



# Mocking HTTP Requests

NOT TRIVIAL

we're going to trade-off some confidence for convenience and we'll make up for that with E2E tests. So for all of our Jest tests, we'll start up a mock server to handle all of the `window.fetch` requests we make during our tests.


 window.fetch isn't supported in JSDOM i.e. Node, so we have to use the `whatwg-fetch polyfill

To handle these fetch requests, we're going to start up a "server" which is not
actually a server, but simply a request interceptor. This makes it really easy
to get things setup (because we don't have to worry about finding an available
port for the server to listen to and making sure we're making requests to the
right port) and it also allows us to mock requests made to other domains.

enter the mock service worker
https://mswjs.io/

One-time override
Request handler override can be used to handle only the next matching request. After a one-time request handler has been used, it never affects the network again.