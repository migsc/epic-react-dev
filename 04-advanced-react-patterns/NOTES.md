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
