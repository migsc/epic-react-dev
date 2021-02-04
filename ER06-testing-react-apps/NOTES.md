Testing is about building confidence in the code you've written so that you
become more sure that making changes in one place does not affect you in
another.

- Looking at a component you want to test, think "If I was a manual tester how
  would I test this?" and make it do that.

# 01 Simple Test with ReactDOM

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

---

introduction to jest with nothing else other than the Browser apis for finding
and manipulating elements

lot of gotchas

---

when firing events programatically on elements like this for tests, you probably
wanna stick to dispatchEvent and pass an instance of a bubbling MouseEvent.

button = 0 means left click cancelable - by default setting when user clicks on
button so that's why we add it here.

a lot of event don't have a convenient method on the target like click does.
also React uses event delegation and bubbling is required in oroder for that to
work.

make sure to clean up before/after your tests using beforeEach so that tests can
run in isolation of each other.

# 02 Simple Test with React Testing Library

React Testing library gives us a lot of benefits.

- automatic cleanup of the DOM between tests for libraries like jest that
  support the beforeEach global
- automaic unmounting of components
- utilities for rendering components to the dom, firing events, and more.

he introduces us the library here but we're still not using it to its fullest
potential here because we're not using the querying features.

# 03 Form Testing

Important things to test in form/user input of any kind:

1. the user can find inputs in the form
2. the user can fill in their information
3. when they submit the form the submitted data is correct.

always inspect elements first to see how they are parsed in the accessibility
view of the chrome debugger

you can also paste your code into https://testing-playground.com/ to traverse it

(i actually installed the chrome extension which is a little more convenient for
me)

it's good practice to use getByRole or getByLabelText for most elements.
Password inputs actually don't have a predefined role for security purposes
though.

if you want to be clean, you could just select text boxes by label text and
given you are doing some stuff after such as typing into them and submitting a
form, it shouldn't be too much of a problem because your test would fail
correctly if you weren't able to select that box correctly.

remember to DRY (don't repeat yourself) with form values as it also helps with
communicating in the test that you are testing submitted data against what you
typed.

# 04 Mock Functions

so now we get into mocking...

Mock functions are also known as "spies", because they let you spy on the
behavior of a function that is called indirectly by some other code, rather than
only testing the output. You can create a mock function with jest.fn(). If no
implementation is given, the mock function will return undefined when invoked.

you can do things like pass a function/callback and ask if it was called.

you could also ensure that a mock function is called with the right arguments

generate usernames and passwords to 1) communicate that the values themselves
don't actually matter and 2) to get more confidence in testing a wider sets of
values that can bypass special logic.

use faker!

when generating values this way, it's important to also allow overrides if 1)
you don't want to generate large data or 2) you want to test a special case

There's a library I like to use for generating test data:
[`@jackfranklin/test-data-bot`](https://www.npmjs.com/package/@jackfranklin/test-data-bot).

This library is great because it comes with faker already and a clean way to
create "build" functions that provide your fields

these are also called object factories

# 05 Mocking HTTP Requests

NOT TRIVIAL

we're going to trade-off some confidence for convenience and we'll make up for
that with E2E tests. So for all of our Jest tests, we'll start up a mock server
to handle all of the `window.fetch` requests we make during our tests.

window.fetch isn't supported in JSDOM i.e. Node, so we have to use the
`whatwg-fetch polyfill

To handle these fetch requests, we're going to start up a "server" which is not
actually a server, but simply a request interceptor. This makes it really easy
to get things setup (because we don't have to worry about finding an available
port for the server to listen to and making sure we're making requests to the
right port) and it also allows us to mock requests made to other domains.

enter the mock service worker https://mswjs.io/

One-time override Request handler override can be used to handle only the next
matching request. After a one-time request handler has been used, it never
affects the network again.

server should always respond in the same way the "actual" server would respond.

remember to use screen.debug while you're doing the test to troubleshoot. you
don't have to console.log individual elements and such.

you can also use mock server handlers in development! allows you to start
writing UI for APIs that aren't finished yet! it was originally developed for
this purpose too!

file structure **test** / your tests live here test / your utils live here

- server-handlers
- server / ready to use server setup that imports the handlers and starts the
  service worker for the browser env
- test-utils

the idea is that you would have started building your app with mock requests and
then you would begin

you want to test not just that you can log in, but that your UI can react
correctly when

- there's a known error like a 400. define these in setup.
- when there's an unknown server error like 500. define these as one-off because
  you don't want to clutter up your test.

what if displayed error messages change and break our tests? We can avoid this
with inline snapshots.

```
The snapshot artifact should be committed alongside code changes, and reviewed as part of your code review process. Jest uses pretty-format to make snapshots human-readable during code review. On subsequent test runs, Jest will compare the rendered output with the previous snapshot. If they match, the test will pass. If they don't match, either the test runner found a bug in your code (in the <Link> component in this case) that should be fixed, or the implementation has changed and the snapshot needs to be updated.
```

basically call toMatchInlineSnapshot without any args on an assertion when jest
runs, and it'll fill in your args with a string representing what was rendered.

next time when you run your tests after changing a component, your tests might
fail due to snapshots not matching. just press `u` in the terminal and watch the
inline snapshot arguments update correctly!

# 06 Mocking Browser APIs and Modules

we're running our tests in a simulated browser which isn't able to do certain
things. (matchMediaPolyfill, Location)

Every time you create a fake version of what your code actually uses, you're
"poking a hole in reality" and you lose some confidence as a result (which is
why E2E tests are critical). Remember, we're doing it and recognizing that we're
trading confidence for some practicality or convenience in our testing.

```
When you mock something, you're making a trade-off. You're trading confidence for something else. For me, that something else is usually practicality — meaning I wouldn't be able to test this thing at all, or it may be pretty difficult/messy, without mocking. (Like in our credit card example.)
```

things you gotta mock in unit/integratoin tests (according to kcd)

- animation libraries
- network requests
- browser apis that dont exist in jsdom

[The Merits of Mocking](https://kentcdodds.com/blog/the-merits-of-mocking)).

[But really, what is a JavaScript mock?](https
://kentcdodds.com/blog/but-really-what-is-a-javascript-mock)

- contract testing to ensure that the contract between your code and a third
  party service is kept in check. might be good for apis

how to organize commonly used mocks

```
other/whats-a-mock/
├── __mocks__
│   └── utils.js
├── __tests__/
├── thumb-war.js
└── utils.js
```

- if you are testing something that really relies on browser APIs or layout
  (like drag-and-drop) then you may be better served by writing those tests in a
  real browser (using a tool like [Cypress](https://cypress.io)). basically E2E
  test?

you can create mocks for all exports of a module with jest.mock

to partially mock a module, use the second arg of jest.mock to provide a
callback that constructs a a partially mocked module.

the act warning:

````
    Warning: An update to Location inside a test was not wrapped in act(...).

    When testing, code that causes React state updates should be wrapped into act(...):
    ```
````

why does this happen? react is trying to warn us that something has happened to
our component when we weren't expecting anything to happen at all. we have to
let react know that there were some updates.

act is a way saying, "react here's an action that's gonna cause state updates
and you need to flush all the side effects once this resolves"

in this case it happens on resolve() which causes the rendered Location to have
its state updated via useCurrentPosition which uses getCurrentPosition.

??? ok wait, were we not updating the state like this in previous examples? well
up until now we've only been firing user events, for which react-testing-libary
will handle calling act() for us behind the scenes this is the first time where
we've triggered a state update via direct means?

the reason we use queryByLabelText and not getByLabelText for the loading
indicator in this part is because it the latter throws an error if it can't be
found. the former will return null which allows us to keep moving

and the reason we don't use waitForElementToBeRemoved in this case is because it
requires the element to exist before its removed. otherwise it throws an error.
the resolve happens so fast that we can't query it beforehand. we can only
assert that it's no longer there after the fact.

??? why not generate fake positions here ???

--- 06 extra 1 final

alternativaly, instead of mocking getPosition, we could have called

```
jest.mock('react-use-geolocation')
```

to mock the hook that the Location component is using. jest will find all
exports of this hook module.

you can now redefine this value that simply returns some undefine data at first,
and you can act() out a state update with the set function you expose from
useState within your mocked hook.

if the hook took any arguments, you could use toHaveBeenCalledWith to ensure it
was called with the right arguments.

- we don't bother with how many times a function component is called because
  there's no gaurantee react will calll our component a certain number of times.

--- 06 extra 2

to test the unhappy path in our function mock, we just need to

- call the error callback
- reject within act block

to test the unhappy path in our hook mock, we just need to

- update the error message state within the act block

and in either test implementation, assert loading message not in the document,
and that the error message appears in the document.

# 07 testing with context and a custom render method (ie mocking context)

how do you mock components context?

you must wrap that component in the appropriate comntext provider in your call
to render

that almost works but not quite because you can't send new props via the
provider to the component unless you call rerendder() (returned from render)
with the same jsx argument, only a different prop

and that's what the wrapper is option is for. so you don't need to call
rerenders with new values. it's not necesarry for this exercise.

--- extra 1

pretty much a copy paste. we're still only testing the inital render to have a
certain style

--- extra 2

introducing a wrapper render function that can wrap the components/jsx you pass
with your context provider. this pretty nice because you could have multiple
context providers at your app level that your component depends on. (e.g. redux,
apollo, etc.)

you can use this as a utility across your test suites if you need to

-- extra 3

you should have a test utils modules that imports @testing-library/react

```
export * from 'the library'
```

it's kind of a implementation detail to select providers that you need for each
test.. for more confidence you want to be rendering with all your providers
typically found at the root of the app. so that's the idea with creating a
module that makes your own render function to use everywhere

`if you configure Jest properly, then you can say, "Hey, Jest. Any of the files that I have in the src directory are going to be accessible as if they are a Node module.`

# 08 testing custom hooks

test custom hooks within components because that resembles the way they are
used.

lol in this one you basically end up rewriting exercise 3, only the component is
not one your testing anymore rather, the component is part of the setup for your
test on this hook.

-- extra 1

Sometimes, you do have a custom hook that is pretty complicated. Making a custom
component that uses that hook in the way that it should be used is a little bit
difficult. Especially when you want to cover some edge cases and things, it
makes your test a little difficult to read.

so make a component that returns null, and assign a result of the hook outside
of the comopnent. You still need to create a component because otherwise react
will complain you're using the hook outside a componet.

this is definitely a situation whereby you're updating the state directly
without react knowing so you have to wrap with act.

-- extra 2

now you're creating an easily reusable setup function for your test suite much
like we did before with the loginForm values in execise 4 allows customization
of initial props

--- extra 3

and so just like that previous exercise, he introduces us to a library here that
can help us provide that hook
