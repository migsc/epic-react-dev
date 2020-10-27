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

## Questions

Is useReducer a wrapper around useState?
