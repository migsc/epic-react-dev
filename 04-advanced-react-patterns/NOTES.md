# Context Module Functions

Context providers + useReducers make for a powerful API. Careful when giving the
users help function to call dispatch for actions. You want to reduce the amount
of things you pass down the component tree and it clutters things up having to
memoize these helper functions if you declare them within your custom hook. You
also won't be able to code split or tree shake the context module functions.
Instead pass down dispatch and define helper function in your module outside
your custom hook that can receive your dispatch func as an argument.

The other benefit to helper functions besides cleaner syntax is being able to
call multiple dispatches in the right order for the user of the context module.

Setting the displayName property on a ContextProvider component will make it so
that your provider and consumer show up with a friendly name in your dev tools.

You can always async your helper functions and return promises for fetches in
order to handle errors.

```
// src/context/counter.js
const CounterContext = React.createContext()

function CounterProvider({step = 1, initialCount = 0, ...props}) {
  const [state, dispatch] = React.useReducer(
    (state, action) => {
      const change = action.step ?? step
      switch (action.type) {
        case 'increment': {
          return {...state, count: state.count + change}
        }
        case 'decrement': {
          return {...state, count: state.count - change}
        }
        default: {
          throw new Error(`Unhandled action type: ${action.type}`)
        }
      }
    },
    {count: initialCount},
  )

  const value = [state, dispatch]

  return <CounterContext.Provider value={value} {...props} />
}

function useCounter() {
  const context = React.useContext(CounterContext)
  if (context === undefined) {
    throw new Error(`useCounter must be used within a CounterProvider`)
  }
  return context
}

const increment = dispatch => dispatch({type: 'increment'})
const decrement = dispatch => dispatch({type: 'decrement'})

export {CounterProvider, useCounter, increment, decrement}
// src/screens/counter.js
import {useCounter, increment, decrement} from 'context/counter'

function Counter() {
  const [state, dispatch] = useCounter()
  return (
    <div>
      <div>Current Count: {state.count}</div>
      <button onClick={() => decrement(dispatch)}>-</button>
      <button onClick={() => increment(dispatch)}>+</button>
    </div>
  )
}
```

# Compound Components

Compound components work together to form a complete UI. Solves the problem
components that take huge amounts of props for customization. You have one
parent component managing the state while child components provide configuration
for the API.

The challenge is though that your user has to declare these JSX elements without
passing the props they need. So you need to receive the children at the parent
components and map + clone them to provide them with the internal state you have
via their props.

You have to clone because you cannot modify the props directly. React will throw
a TypeError if you do that.

The props you pass down to the cloned compound child components are "implicit"
from the perspective of the user.

```
function Foo({children}) {
  return React.Children.map(children, (child, index) => {
    return React.cloneElement(child, {
      id: `i-am-child-${index}`,
    })
  })
}

function Bar() {
  return (
    <Foo>
      <div>I will have id "i-am-child-0"</div>
      <div>I will have id "i-am-child-1"</div>
      <div>I will have id "i-am-child-2"</div>
    </Foo>
  )
}
```

Supporting DOM component children can be done by checking if your mapped/cloned
component is a string.

But a better way of doing that would be check for allowed types. You can do that
by doing an equality comparison with the function/component against the
child.type.

# Flexible Compound Components

How do you get the implicit state down to nested children and not just immediate
children? You could search props.children for the components to clone but it'd
be easier to use Context to share the implicit state and then render the
children within your parent component as you receive them.

Remember to use the children.map version of this pattern if you only care about
direct descendants and want to enforce that.

# Prop Collections and Getters

You can extract the logic of props you need to provide to a component via a prop
collection, i.e. a hook that returns "componentNameProps"

To provide custom props to that hook, turn your collection returned by the hook
into a function so that "componentNameProps" turns into "getComponentNameProps".

Spread the custom props after your default ones so that the consumer can
override them.

For props you don't want to be overidden but instead, added to, like onClick.
You can use this function argument syntax:

```
  function getTogglerProps({onClick, ...props} = {}) {
```

To grab onClick from the props provided. That way you can return a handler that
calls both your code and the custom handler.

# State Reducer

The state reducer pattern is a way of inverting control for state updates.
Similar to the prop collection/getters, you provide your own logic via hook
params. In this case, you provide a reducer which can optionally use a default
reducer implemented by the custom hook. Action types should also be provided in
a way that reduces typos by either a collection of strings or enums.

# Questions for KCD

The problem with helper methods as I understand it, is that it affects
performance to pass down these methods as is or having to use useCallback to do
it...? And this is not the case with helper methods in say a hook because you're
usually consuming the hook in one component, one level of the tree?

In Context Module Function wouldn't a better error message be placed in each
component, so it could tell you the name of the component ToggleButton,
ToggleOn?
