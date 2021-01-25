# React Fundamentals

Declarative apis cater to the mental models of developers React Hooks

Special functions that hold state, perform side effects.

https://reactjs.org/docs/lists-and-keys.html useState: greeting

## React.useState:

Accepts a single arg for intial state, returns a pair/tuple for 1) state
value 2) function to update/set state Calling the set state function causes
entire function/component it's in to re-run and then to re-render in the DOM.
Continues until unmount i.e. Component removed from the application.

Each call to setState should correspond to a new re-render with the latest
value.

State is data that changes over time.

Passing a state value to the value prop of an input turns that input into a
"controlled component" i.e. bound to the state value.

The other custom built-in hooks:

React.useEffect React.useContext React.useRef React.useReducer

Never switch components from uncontrolled to controlled! Causes bugs!

## useEffect: persistent state

Side effects are things that should happen in the "outside world" from a
function.

The useEffect hook runs custom code on a specific render/re-render of the
component. Callback function given is run AFTER the DOM is updated.

https://raw.githubusercontent.com/donavon/hook-flow/master/hook-flow.png

Passing nothing in the second argument of useEffect causes it to call the
function on every re-render. It's like "I depend on everything!"

Pass a function to useState so that it only runs that initial expression on the
first render. e.g. getting item from local storage. Can be slow. This feature is
called lazy state initialization.

Don't mindlessly use this feature though. It's more expensive to pass a function
than it is to pass a primitive or some other simple expression.

Custom hooks helps encapsulate reusable logic in the form of a collection of
built-in hooks. Use it in other components!

Functions can re-render because the parent re-renders.

Second argument to useEffect is a dependency list, array. Suppose [x,y,z] then
the state of the world is going to fall out of sync with the state of my
application when x y or z change.

Dependency array should only include those dependencies which you are using
within the effect that can change over time.

React only shallows compares for the useEffect dependencies. Objects are no good
then for dependency array if they're being declared on every re-render cause
their references will always change.

A custom hook is only a function that uses hooks. The prefix/convention of 'use'
does not affect that determination.

Need a value/object you can trigger without re-renders? Use useRef! Mutate with
ref.current = new ref value

The cleanup function you return from an effect needs to be run before the
cleanup function is run again on another re-render. So a useEffect with
undefined dependencies runs clean up after every re-render and one with no
dependencies (i.e. mount) runs it once when the component unmounts. All effect
cleanups run on an unmount.

state updates within a child component do not cause a parent to rerender.

More on Hook Flow

React updates DOM i.e., takes your createElement results and create DOM elements
out of all of them after running lazy initializer and an initial "render"

https://raw.githubusercontent.com/donavon/hook-flow/master/hook-flow.png

LayoutEffects we will learn about later but they're basically like useEffect
callbacks. They happen right after DOM is updated.

React "stops running" at a certain point and lets the browser know(?) (how) to
repaint the screen... isn't it just using createElement behind the scenes? or
something else entirely?

Browser paints screen and then effects are run.

And then.. hang out, wait, user interacts or subscription service changes ctate,
whatever to trigger another re-render at the that time

The second time around and thereafter with the re-renders, "cleanup" on
LayoutEffects are run.

On unmount we get a cleanup of layout effects and cleanup of effects

## Lifting state

https://reactjs.org/docs/lifting-state-up.html

The way you share state between two sibling components is to just have the
direct parent manage it... or more technically the lowest common parent. Then
pass the state down as well as the mechanism for updating the state.

Typically you want to share state as close to where it's relevant as possible,
ideally within the component, but requirements change and force you to lift the
state.

The opposite lifting state is colocating state. Moving it back down when the
parent's managed state is only being used by one child component. IT's easy to
forget this but the benefit to doing it is that you get a faster app, avoid
uneccessary rerenders.

State colocation makes it also easier to maintain components when you go to
reuse them cause you have to worry less about passing the right props.

## useState: tic tac toe

Building a real UI requires multiple useStates obviously, each with their own
unique state and updater function.

Managed State: State you need to explicity set and manage Derived State: State
calculated from some other state

The alternative to derived state is syncing state, but it's not a very good
idea. You have to duplicate code to sync state with each other in several
handlers/effects and may forget to call the correct sets. You could have all
relevant state updates happen in one place.

But if you identify that you have a true component state, that is the heart of
your state upon which all other states depend on and you need to sync with, then
just forgo useState for these derived states and calculate off the true
component state. Performance will usually not be affected too much with this
approach and cleaner code will be written. If you are doing an expensive
calculation for derived state, than use useMemo. But useMemo may not even
necessary if you only have one useState value on which the memo depends, because
you'll always need to recalculate. So useMemo can only really help if you have
more than one useState values and you depend on either of them, and even then,
it's got to be an expensive calculation to be worth it. Measure first!

React relies on state changes to trigger a rerender. Don't ever mutate your
state values. You could have stale closures referencing those mutated values and
create more bugs for yourself. Always copy from state first.

Refactoring Class to Function

Class constructors are basically lazy initializers.

Most state references have their this reference removed because now it's just
coming from the closer

## useRef and useEffect: DOM interaction

You don't have access to the DOM. Only ReactDOM.render creates dom elments
behind the scenes.

Using a ref is a way to ask React to give you access to a DOM node.

refs have their current property set to a DOM node after the component they're
within has been mounted.

\*createElement creates ui descriptor objects

the reason the console shoes undefined ref.current property if you log in render
is that it's undefined until it's passed into the ref attribute of a JSX
component.

once you expand it in a browser, that's evaluated.

The current property is mutable. IT's an escape hatch for any other values you
want to maintain a reference to and make changes to without triggereing
rerenders.

document.querySelector as opposed to useRef: useRef will be more reliable

## useEffect: HTTP requests

http requests are side effects just like DOM interaction, browser APIs like
localstorage. So useEffect is key

making the callback passed to useEffect async won't work because and async
function will wrap the return in a promise.

Your error divs should have a role of "alert" so that screen readers can read
them.

Use a status state for asynchronous code to clean up code, and avoid bugs where
you've set some error state and depnd on that state to return the error ui.

Calling multiple state updates in a row, React will batch those calls so that
you only get a single re-render but it won't be able to do that in an async
callback.

## Questions

React "stops running" at a certain point and lets the browser know(?) (how) to
repaint the screen... isn't it just using createElement behind the scenes? or
something else entirely?

What does it mean to re-render? Does it mean the React.createElement calls will
be made again? Does it mean that something intially kicked off by
ReactDOM.render will do something?

ReactDOM.render() controls the contents of the container node you pass in. Any
existing DOM elements inside are replaced when first called. Later calls use
React’s DOM diffing algorithm for efficient updates.

How do these functions interact with my component behind the scenes? What makes
them special? Could I build my own implementation of the useState hook?

Is it expensive to have a controlled input that causes the whole surrounding
function and JSX to re-render/run as the user types / onChange fires so many
times?
