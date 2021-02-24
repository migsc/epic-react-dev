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

ok weird he defined the promise outside the component but i think this was to
demonstrate just how different this is. we don't have to use useEffect with
because of how Suspense works.

React's Suspense renders your component within a try-catch, which is why
throwing a promise works to let React know to render a fallback if it's resolved
yet.

One benefit of this is that the data is being loaded as soon as the module is
loaded, not waiting for mount.

extra 1

error boundary

"all that you need to do the handle errors with React Suspense in Concurrent
Mode is make sure that the asynchronous thing that you're doing has an error
handler. Keep track of that error. If there is an error, go ahead and throw it,
and you ErrorBoundary can handle it for you as well."

extra 2

createResource helps abstract away this logic of throwing the promise and the
error

based on status you can pending - throw the promise rejected - throw the error
resolved - throw the data

his code is a little cleaner, the result refers to the promise, rejection or
resolve payload. and we handles each status for clarity.

extra 3

make your Suspense fallbacks as usual as possible

# Render as you fetch

There's fetch on render (what we're used to doing with use effect hooks) and
render as you fetch which is what these experimental apis encourage us to do

"The idea here is: get the data **as soon as you have the information you need**
for the data. This sounds obvious, but if you think about it, how often do you
have a component that requests data once it's been mounted. There's a few
milliseconds between the time you click "go" and the time that component is
mounted... Unless that component's code is **lazy-loaded**. In which case,
there's a lot more time involved (first load the code, then parse the code, then
run the code, then render the component, and finally make the request) and your
users are hanging around waiting while they could be making requests for the
data they need."

Suspense handles both lazily loading components or suspended components waiting
for async resources.

onReset for error boundaries lets us recover from errors

? and resetKeys if passed will let data we want to reset go back to some "happy
state" did he mean iniital state?

any child of a Suspense that suspends ie throws a promise makes React look for
the closest Suspense up the tree.

same goes for children of ErrorBoundary that throw an error.

so placement matters.

# useTransition

configure how your loading states appear over time.

Based on Facebook's research, Suspense will wait a little bit before rendering
your fallback. It does this in case your async resource resolves really quickly.

"there’s that brief amount of time that your app will appear to be unresponsive
to the user and it’d be great if we could avoid that."

enter the useTransition hook

useTranstion provides 2 items

- startTransition - what interaction should trigger is pending to be set to true
- isPending - set true while waiting for async thing to finish
  - - but how long should isPending to be set to true before Suspense fallback
      comes in? that's what the config is for

wrap the existing call to set the resource in a transition

your delay (which is no longer supported to customize) controls the how long the
first loading state goes for before the next loading state i.e. your fallback is
displayed.

basically now we have two loading states. the first could be more to visually
indicate the data you're currently looking at is stale, the second is your
fallback that might represent the structure of the new data.

extra credit 1

say the delay is more like 50ms and the transition's config timeout is way
bigger like 250ms

"If the user has a really fast connection, then they’ll see a "flash of loading
content" which isn’t a great experience."

basically use a class that has a css transition to delay the opacity style by a
certain amount of time. so now you have a timeout on the style using
'transition-delay' property

extra credit 2

right about here is here is where i felt like skipping, given they already
removed these options.

we fixed the issue for fast connections but not for slow connections where the
delay is longer.

```
const SUSPENSE_CONFIG = {
  timeoutMs: 4000,
  busyDelayMs: 300, // if we've been pending for at least 300ms
  busyMinDurationMs: 700, // then I want to be pending for a total of 700ms,
}
```
# Cache resources

cache the pokemon resources basically. 

"here’s a quick tip. Creating a new promise in the render method is dangerous because you cannot rely on your render method only being called once"

we create a resource cache and accessor method to it which basically takes the arguments of our resulting network request

extra 1 context cache

you're better off using a caching abstraction like react-query than building your own.

so far, no cache invalidation built-in. we move it into context

extra 2 cache timeout 

move the cache itself into a useRef so it's tied to that context component

extra 3 cache timeout 

i used setTimeout to do this within the  getResource function

he created expirations for each and ran a side-effect that use setInterval to check the cache expiration of each entry every second.

# Suspense Image

browser has no API for handling async state in loading images. It does it for you. 

we can work around this with promises...

```
function preloadImage(src) {
  return new Promise(resolve => {
    const img = document.createElement('img')
    img.src = src
    img.onload = () => resolve(src)
  })
}
```
once this resolves, browser has it in cache.

and so we can use Suspense to do things like render a fallback in the image's place, while it's loading.


on a slow network, the pokemon info loads but then the image takes some time to load after that, bumping the information down.

you could fix it by setting a fixed height, but let's assume you can't.

Option 1: Make an Img component that suspends until loaded -----> nothing will render until both data and image are rendered
Option 2: Make request for image alongside pokemon data


first approach in this exercise was Option 1

extra 1 - avoid waterfall

image src is in API payload for pokemon so we can't load image until we load data i.e. waterfall. we can predict the image URL though based on pokemon name with a function.

so now we try Option 2, preloading with the rest of the . we create the resource for the data and the image and store it in the same place, same object.

extra 2 - render as you fetch

so now we lazy load the PokemonInfo component itself so we can load the initial app a little quicker

"Note that rendering lazy components requires that there’s a <React.Suspense> component higher in the rendering tree. This is how you specify a loading indicator."

https://reactjs.org/docs/react-api.html#reactlazy

# Suspense with a custom hook (easy)

make it convenient for users so they don't have to call startTransition. let the custom hook do it

```
const [pokemonResource, isPending] = usePokemonResource(pokemonName)

```

as long as the user of the hook is rendering a suspense boundary they’ll be able to interact with our hook as if it’s synchronously giving them pokemon information, drastically simplifying their own code (they don’t need to worry about loading or error states).

extra 1 

swap out the implementation. much cleaner cause now you don't need to import/create how those utility functions..

here he reinforces the advanced hoook patterns we learned.

# Coordinate Suspending components with SuspenseList (easy)

it's better to create a predictable loading experience even if it means the user is seeind data being displayed out of order from how it is loaded.

you can coordinate it with React.SuspenseList

```
<React.SuspenseList revealOrder="forwards">
  <React.Suspense fallback="Loading...">
    <ProfilePicture id={1} />
  </React.Suspense>
  <React.Suspense fallback="Loading...">
    <ProfilePicture id={2} />
  </React.Suspense>
  <React.Suspense fallback="Loading...">
    <ProfilePicture id={3} />
  </React.Suspense>
</React.SuspenseList>
```
key prop is revealOrder undefined|"forwards|backwards|together"

tail determines how to show fallbacks
  default is show all. "collapsed" shows fallback for component to be rendered next. "hidden" shows none


you can also nest SuspenseLists

* NOTE: childrend Suspense components do not need to be direct children

(i couldn't get this to work because i kept getting a 500 from the service worker backend api he created with the error: {"status":500,"message":"Cannot read property 'includes' of undefined"})