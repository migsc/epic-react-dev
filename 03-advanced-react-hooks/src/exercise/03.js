// useContext: simple Counter
// http://localhost:3000/isolated/exercise/03.js

import React from 'react'

const CountContext = React.createContext()

function useCount() {
  const [count, setCount] = React.useContext(CountContext)
  if (typeof count === 'undefined') {
    throw new Error('useCount must be used within a CountProvider')
  }
  return [count, setCount]
}

function CountProvider({children, ...props}) {
  const [count, setCount] = React.useState(0)
  return (
    <CountContext.Provider value={[count, setCount]} {...props}>
      {children}
    </CountContext.Provider>
  )
}

function CountDisplay() {
  const [count] = useCount()
  return <div>{`The current count is ${count}`}</div>
}

function Counter() {
  const [, setCount] = useCount()
  const increment = () => setCount(c => c + 1)
  return <button onClick={increment}>Increment count</button>
}

function App() {
  return (
    <div>
      <CountProvider>
        <CountDisplay />
        <Counter />
      </CountProvider>
    </div>
  )
}

export default App
