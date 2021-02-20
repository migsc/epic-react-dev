# Background

This update to React, and this module attempts to improve I/O (networking) and
CPU in the context of react apps

========

===

CPU - creating dom nodes, re-rendering Concurrent mode for processing different
parts of the react fiber tree.. this asynchronous mode helps performance because
high prior updates like user input won't be blocked by low priority updates like
rerendering arbitrary components

Time-slicing is what this feature is called in react

- doesnt block thread on rendering
- feel sync when device is fast
- feels responsive when device is slow
- only final rendered state is displayed
- same declarative component model

version control is a good metaphor. without vc, you can't interrupt your work to
handle something else more important like a bug.

===

I/O - data fetching, code splitting. Suspense for data fetching

Suspense is a way for components to suspend rendering while they load
asynchronous data, dependencies or just anything asynchronous

- pause any state update until the data is ready
- add async data to any component without plumbing
- on fast network, render after whole tree is ready
- on slow network precisely control the loading states
- there's bth a high-level and a low-level api

basically react knows that some of the children have async dependencies so it
suspends the tree it's in.

# Concurrent Mode

You must opt-in to concurrent mode for an entire application.

enabling-concurrent-mode.js

```
// http://localhost:3000/isolated/examples/enabling-concurrent-mode.js

import * as React from 'react'
import ReactDOM from 'react-dom'

function App() {
  return <div>Hello React World!</div>
}

const rootEl = document.getElementById('root')

// the old way:
// ReactDOM.render(<App />, rootEl)

// the new way:
const root = ReactDOM.createRoot(rootEl)
root.render(<App />)
```


# Simple Data-fetching

ok weird he defined the promise outside the component but i think this was to demonstrate just how different this is. we don't have to use useEffect with because of how Suspense works.

React's Suspense renders your component within a try-catch, which is why throwing a promise works to let React know to render a fallback if it's resolved yet.

One benefit of this is that the data is being loaded as soon as the module is loaded, not waiting for mount.

extra 1

error boundary

 "all that you need to do the handle errors with React Suspense in Concurrent Mode is make sure that the asynchronous thing that you're doing has an error handler. Keep track of that error. If there is an error, go ahead and throw it, and you ErrorBoundary can handle it for you as well."

extra 2

 createResource helps abstract away this logic of throwing the promise and the error

 based on status you can 
  pending - throw the promise
  rejected - throw the error
  resolved - throw the data

  his code is a little cleaner, the result refers to the promise, rejection or resolve payload. and we handles each status for clarity. 

  extra 3

  make your Suspense fallbacks as usual as possible