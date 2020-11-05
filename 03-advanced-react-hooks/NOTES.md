# Advanced React Hooks

- _**Most important: The state gang**_
  - useReducer - useState's big brother
  - useContext - "Global" useState. Used by state mgmt and theming libs
- _**also...**_
  - useDebugValue - console.log's big brother
- _Less important - Very situational_
  - useCallback - useful for methods invoked within useEffect
  - useLayoutEffect - useful for DOM manipulation
- _Least important, ULTRA rare uses:_
  - useImperativeHandle - useful for class-component like functionality. Good
    for refactoring to functional.

## useReducer: simple Counter

useReducer: Separate state logic from components that will make the state
changes. **Very useful if multiple element of state change together.** Usually
used to track an object of state.

**First arg =>** The dispatch function, which takes two args: **1-** current
state **2-** the dispatched value/action, whatever is passed into the function
**and returns- the next state!**

**Second arg =>** initial value

**Myth** You have to use the heavy redux conventions and boilerplate with
useReducers.

useState and useReducers have tradeoffs.

**A single element of state being managed? you're better off with useState.**

When one element of your state relies on the value of another element of your
state in order to update? Use useReducer

https://kentcdodds.com/blog/should-i-usestate-or-usereducer
https://kentcdodds.com/blog/how-to-implement-usestate-with-usereducer

Pass the 3rd arg (a func) to useReducer, to receive the 2nd arg (initial
state/props) to that func and use the 3rd arg func's return value as initial
state. Useful for localStorage, or something else to not happen every render.

\*\* Best to throw an error if your action type is unsupported. \*\* Don't apply
this action type patter mindlessly. Transition into it as your reducer gets more
complicated.

## useCallback: custom hooks

**useCallback can be a convenience.** Suppose you have dependencies in your
useEffect, then you extract the logic out of the useEffect into a function. Now
it's not clear that those dependencies represent the body of the extracted
function. You can wrap the function in useCallback and declare that as a
dependency in the useEffect dependency list.

```

// We needed to extract the logic for fetching within this component and pass it into our hook...

function PokemonInfo({pokemonName}) {
  const asyncCallback = React.useCallback(() => {
    if (!pokemonName) {
      return
    }
    return fetchPokemon(pokemonName)
  }, [pokemonName])

  const state = useAsync(asyncCallback, {
    status: pokemonName ? 'pending' : 'idle',
  })


// ...where it would be used within an effect
function useAsync(asyncCallback, initialState) {
  const [state, dispatch] = React.useReducer(asyncReducer, {
  ...

  React.useEffect(() => {
    const promise = asyncCallback()
    ...
  }, [asyncCallback])


  return state
}

// Linting for dependencies still works for this!
```

And you need useCallback to put the function in the dependency list because if
you didn't, the function would be redeclared on every render and cause the
effect to always fire.

**Also useCallback is for passing a function into a custom hook along with all
of its dependencies if you know it's going to be used in a useEffect**

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
in the component tree and can't be cleaned up by colocating state.

### #1 Initialize a Context object

```
const YourContext = React.createContext()
```

### #2 Use the Provider component off the context object to provide a wrapper component that will wrap your parent and provide it (along with all its children) a value you can store in state.

```
function YourProvider({children, ...props}) {

  // useState, useReducer etc.

  return (
    <YourContext.Provider value={...} {...props}>
      {children}
    </YourContext.Provider>
  )
}

function SomeParentComponent(props){
  return (
    <YourProvider>
      <Children />
    </YourProvider>
  )
}
```

### #3 Make use of the Context value ideally with a custom hook

```

// A custom hook lets you catch a case where someone uses your provider outside context.
function useYourContext() {

  const context = React.useContext(YourContext)

  if (!context) { // null if not being used within the Provider
    throw new Error('useYourContext must be used within a YourProvider')
  }

  return context
}

function SomeDeeplyNestedChildComponent() {
  const context = useYourContext()

  return ... //
}
```

You really want to provide consumers witha custom hook that wraps useContext so
that you can check for its return being undefined, meaning the user did not wrap
their component tree in a provider

Keep Context scoped to the part of the tree that absolutely needs it for better
performance!

Also consider component composition as an alternative if the only issue you have
is drilling props for a particular component deep in the tree. Something like
this:

```
<Page user={user} avatarSize={avatarSize} />
// ... which renders ...
<PageLayout user={user} avatarSize={avatarSize} />
// ... which renders ...
<NavigationBar user={user} avatarSize={avatarSize} />
// ... which renders ...
<Link href={user.permalink}>
  <Avatar user={user} size={avatarSize} />
</Link>
```

Could be this if you pass down the component itself with the state it needs from
the shared parent:

```
function Page(props) {
  const user = props.user;
  const userLink = (
    <Link href={user.permalink}>
      <Avatar user={user} size={props.avatarSize} />
    </Link>
  );
  return <PageLayout userLink={userLink} />;
}

// Now, we have:
<Page user={user} avatarSize={avatarSize} />
// ... which renders ...
<PageLayout userLink={...} />
// ... which renders ...
<NavigationBar userLink={...} />
// ... which renders ...
{props.userLink}
```

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

![](https://res.cloudinary.com/dg3gyk0gu/image/upload/v1591296082/transcript-images/react-understand-the-react-hook-flow-hook-flow.jpg)

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

![](./exercise/06-devtools-before.png)

## Questions

Is useReducer a wrapper around useState? So is useImperativeHandle a convenience
around modifying the ref.current within useLayoutEffect? Any difference?
