// useCallback: custom hooks
// http://localhost:3000/isolated/exercise/02.js

import React, {useCallback, useEffect, useLayoutEffect} from 'react'
import {
  fetchPokemon,
  PokemonForm,
  PokemonDataView,
  PokemonInfoFallback,
  PokemonErrorBoundary,
} from '../pokemon'

// const abortController = new AbortController()

function asyncReducer(state, action) {
  switch (action.type) {
    case 'pending': {
      return {status: 'pending', data: null, error: null}
    }
    case 'resolved': {
      return {status: 'resolved', data: action.data, error: null}
    }
    case 'rejected': {
      return {status: 'rejected', data: null, error: action.error}
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

function useIsMountedRef() {
  const mountedRef = React.useRef(false)

  useLayoutEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
    }
  }, [])

  return mountedRef
}

function useSafeDispatch(unsafeDispatch) {
  const isMounted = useIsMountedRef()

  const safeDispatch = useCallback(
    (...args) => {
      if (isMounted.current) {
        unsafeDispatch(...args)
      }
    },
    [isMounted, unsafeDispatch],
  )

  return safeDispatch
}

function useAsync(initialState) {
  const [state, unsafeDispatch] = React.useReducer(asyncReducer, {
    data: null,
    error: null,
    ...initialState,
  })

  const dispatch = useSafeDispatch(unsafeDispatch)

  const run = useCallback(
    promise => {
      if (!promise) {
        return
      }

      dispatch({type: 'pending'})

      promise
        .then(data => {
          dispatch({type: 'resolved', data})
        })
        .catch(error => {
          dispatch({type: 'rejected', error})
        })
    },
    [dispatch],
  )

  return {...state, run}
}

function PokemonInfo({pokemonName}) {
  const {data: pokemon, status, error, run} = useAsync({
    status: pokemonName ? 'pending' : 'idle',
  })

  React.useEffect(() => {
    if (!pokemonName) {
      return
    }
    run(fetchPokemon(pokemonName))
  }, [pokemonName, run])

  if (status === 'idle' || !pokemonName) {
    return 'Submit a pokemon'
  } else if (status === 'pending') {
    return <PokemonInfoFallback name={pokemonName} />
  } else if (status === 'rejected') {
    throw error
  } else if (status === 'resolved') {
    return <PokemonDataView pokemon={pokemon} />
  }

  throw new Error('This should be impossible')
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('')

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName)
  }

  function handleReset() {
    setPokemonName('')
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className="pokemon-info">
        <PokemonErrorBoundary onReset={handleReset} resetKeys={[pokemonName]}>
          <PokemonInfo pokemonName={pokemonName} />
        </PokemonErrorBoundary>
      </div>
    </div>
  )
}

export default App
