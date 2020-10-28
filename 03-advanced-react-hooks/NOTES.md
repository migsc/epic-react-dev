# Advanced React Hooks

## useReducer: simple Counter

useReducer: Separate state logic from components that will make the state
changes. Very useful if multiple element of state change together. Usually used
to track an object of state.

First arg => The dispatch function Takes two args: 1- current state 2-
whatever - the dispatch function is called with 3- returns- the next state!
Second arg => initial value

useState and useReducers have tradeoffs.

- You don't have to use the heavy redux conventions and boilerplate with
  useReducers. You could essentially re-implement useState with useReducer at
  the simplest.

A single element of state being managed? you're better off with useState.

When one element of your state relies on the value of another element of your
state in order to update? Use useReducer

https://kentcdodds.com/blog/should-i-usestate-or-usereducer
https://kentcdodds.com/blog/how-to-implement-usestate-with-usereducer

Pass the 3rd arg (a func) to useReducer, to receive the 2nd arg (initial
state/props) to that func and use the 3rd arg func's return value as initial
state. Useful for localStorage, or something else to not happen every render.

Type defs for useReducer

```
type Dispatch<A> = (value: A) => void
type Reducer<S, A> = (prevState: S, action: A) => S
type ReducerState<R extends Reducer<any, any>> = R extends Reducer<infer S, any>
  ? S
  : never
type ReducerAction<R extends Reducer<any, any>> = R extends Reducer<
  any,
  infer A
>
  ? A
  : never

function useReducer<R extends Reducer<any, any>, I>(
  reducer: R,
  initializerArg: I & ReducerState<R>,
  initializer: (arg: I & ReducerState<R>) => ReducerState<R>,
): [ReducerState<R>, Dispatch<ReducerAction<R>>]

function useReducer<R extends Reducer<any, any>, I>(
  reducer: R,
  initializerArg: I,
  initializer: (arg: I) => ReducerState<R>,
): [ReducerState<R>, Dispatch<ReducerAction<R>>]

function useReducer<R extends Reducer<any, any>>(
  reducer: R,
  initialState: ReducerState<R>,
  initializer?: undefined,
): [ReducerState<R>, Dispatch<ReducerAction<R>>]
```

\*\* Best to throw an error is your action type is unsupported. \*\* Don't apply
this action type patter mindlessly. Transition into it as your reducer gets more
complicated.

## useCallback: custom hooks

useCallback can be a convenience. Suppose you have dependencies in your
useEffect, then you extract the logic out of the useEffect into a function. Now
it's not clear that those dependencies represent the body of the extracted
function. You can wrap the function in useCallback and declare that as a
dependency in the useEffect dependency list.

And you need useCallback to put the function in the dependency list because if
you didn't, the function would be redeclared on every render and cause the
effect to always fire.

Passing dependencies to hook is bad maintainability. Eslint can't check them
dynamically.

Args of useCallback will not be needed in a dependency array.

https://developers.google.com/web/updates/2017/09/abortable-fetch

With promises, you want to be careful you're not setting state on a component
that has already been unmounted. Best way to do this is in a useEffect cleanup
function, ideally useLayoutEffect because it runs just after mount and runs
cleanup just before unmount.

## useContext: simple Counter

Prop drilling is the process of passing through several layers of components
that need the props. It's fine most of the time but can get tedious if props get
over forwarded, under forwarded, prop structure needs to change.

Context is a workaround for those components that need some data but exist deep
in the component tree.

You really want to provide consumers witha custom hook that wraps useContext so
that you can check for its return being undefined, meaning the user did not wrap
their component tree in a provider

Keep Context scoped to the part of the tree that absolutely needs it for better
performance!

## useLayoutEffect: auto-scrolling textarea

useEffect and useLayoutEffect have the same API but differ in when they are run.

99% of the time use useEffect

if you mutate DOM nodes directly, use useLayoutEffect

flow: useLayoutEffect, browser paints, useEffect

1- runs after render 1 - runs after all DOM mutations (so painting not blocked)

useLayoutEffect useful for getting scroll positions or styles from an element
directly.

"Here’s the simple rule for when you should use useLayoutEffect: If you are
making observable changes to the DOM, then it should happen in useLayoutEffect,
otherwise useEffect."

https://kentcdodds.com/blog/useeffect-vs-uselayouteffect

## useImperativeHandle: scroll to top/bottom

Class components could be passed a ref props and expose their properties, say a
method to be used by a parent component like the one below:

```
class MyInput extends React.Component {
  _inputRef = React.createRef()
  focusInput = () => this._inputRef.current.focus()
  render() {
    return <input ref={this._inputRef} />
  }
}

class App extends React.Component {
  _myInputRef = React.createRef()
  handleClick = () => this._myInputRef.current.focusInput()
  render() {
    return (
      <div>
        <button onClick={this.handleClick}>Focus on the input</button>
        <MyInput ref={this._myInputRef} />
      </div>
    )
  }
}
```

Problem: function components can't expose their methods in this way. They have
no component instance to expose.

React.forwardRef alone could fix this but causes bugs with upcoming concurrent
mode and suspense features. Doesn't support callback refs either.

Enter useImperativeHandle.

```
const MyInput = React.forwardRef(function MyInput(props, ref) {
  const inputRef = React.useRef()
  React.useImperativeHandle(ref, () => {
    return {
      focusInput: () => inputRef.current.focus(),
    }
  })
  return <input ref={inputRef} />
})
```

Use with caution. It's better to keep things as declarative as possible unless
absolutely necessary.

Second argument of function component passed to React.forwardRef will be the ref
passed

The basic idea of useImperativeHandle is that it's mutating the current. You
could do this yourself, but you don't want to do this in the middle of render,
not indempotent (could result in different values every render) Within
useLayoutEffect gets you pretty close, setting after render.

## useDebugValue: useMedia

Useful for React Dev Tools browser extension.

You can label your custom hooks in dev tools

Really useful for when computing a debug value that is computationally expensive
and only want to do it when DevTools is open, not while users using app.

Can pass back array of strings from the formatter

## Questions

Is useReducer a wrapper around useState? So is useImperativeHandle a convenience
around modifying the ref.current within useLayoutEffect? Any difference?
