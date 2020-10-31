// useDebugValue: useMedia
// http://localhost:3000/isolated/exercise/06.js

import React from 'react'

const formatMediaValue = ({query, state}) =>
  `useMedia \n query: ${query} \n state: ${state}`

function useMediaState(query, initialState = false) {
  const [state, setState] = React.useState(initialState)
  React.useDebugValue({
    query,
    state,
  })

  // React.useDebugValue(
  //   {
  //     query,
  //   },
  //   ({query}) => `query: ${query}`,
  // )

  // React.useDebugValue(
  //   {
  //     state,
  //   },
  //   ({state}) => `state: ${state}`,
  // )
  React.useEffect(() => {
    let mounted = true
    const mql = window.matchMedia(query)
    function onChange() {
      if (!mounted) {
        return
      }
      setState(Boolean(mql.matches))
    }

    mql.addListener(onChange)
    setState(mql.matches)

    return () => {
      mounted = false
      mql.removeListener(onChange)
    }
  }, [query])

  return state
}

function Box() {
  const isBig = useMediaState('(min-width: 1000px)')
  const isMedium = useMediaState('(max-width: 999px) and (min-width: 700px)')
  const isSmall = useMediaState('(max-width: 699px)')
  const color = isBig ? 'green' : isMedium ? 'yellow' : isSmall ? 'red' : null

  return <div style={{width: 200, height: 200, backgroundColor: color}} />
}

function App() {
  return <Box />
}

export default App
