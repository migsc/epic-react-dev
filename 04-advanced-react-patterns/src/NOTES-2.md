The state reducer pattern is a way of inverting control for state updates.
Similar to the prop collection/getters, you provide your own logic via hook
params. In this case, you provide a reducer which can optionally use a default
reducer implemented by the custom hook. Action types should also be provided in
a way that reduces typos by either a collection of strings or enums.
