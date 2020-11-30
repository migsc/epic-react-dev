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
