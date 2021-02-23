// Cache resources
// http://localhost:3000/isolated/exercise/04.js

import * as React from 'react'
import {
  fetchPokemon,
  PokemonInfoFallback,
  PokemonForm,
  PokemonDataView,
  PokemonErrorBoundary,
} from '../pokemon'
import { createResource } from '../utils'

function PokemonInfo({ pokemonResource }) {
  const pokemon = pokemonResource.read()
  return (
    <div>
      <div className="pokemon-info__img-wrapper">
        <img src={pokemon.image} alt={pokemon.name} />
      </div>
      <PokemonDataView pokemon={pokemon} />
    </div>
  )
}

const SUSPENSE_CONFIG = {
  timeoutMs: 4000,
  busyDelayMs: 300,
  busyMinDurationMs: 700,
}


function createPokemonResource(pokemonName) {
  return createResource(fetchPokemon(pokemonName))
}

const PokemonResourceContext = React.createContext();

function PokemonCacheProvider({ children }) {
  const resourceCache = React.useRef({})

  const getResource = React.useCallback((pokemonName, cacheTime = 60000) => {
    const key = pokemonName.toLowerCase();

    if (resourceCache.current[key]) {
      return resourceCache.current[key]
    }

    // Invalidate cache after a certain time seconds
    setTimeout(() => { resourceCache.current[key] = null }, cacheTime)

    return resourceCache.current[key] = createPokemonResource(key)
  }, [])

  return <PokemonResourceContext.Provider value={getResource}>
    {children}
  </PokemonResourceContext.Provider>
}

function usePokemonCache() {
  const context = React.useContext(PokemonResourceContext)

  if (!context) {
    throw new Error('usePokemonCache can only be used within PokemonCacheProvider')
  }

  return context;
}


const POKEMON_CACHE_TIME = 5000;

function App() {
  const [pokemonName, setPokemonName] = React.useState('')
  const [startTransition, isPending] = React.useTransition(SUSPENSE_CONFIG)
  const [pokemonResource, setPokemonResource] = React.useState(null)

  const getPokemonResource = usePokemonCache()

  React.useEffect(() => {
    if (!pokemonName) {
      setPokemonResource(null)
      return
    }
    startTransition(() => {
      setPokemonResource(getPokemonResource(pokemonName, POKEMON_CACHE_TIME))
    })
  }, [pokemonName, startTransition, getPokemonResource])

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
      <div className={`pokemon-info ${isPending ? 'pokemon-loading' : ''}`}>
        {pokemonResource ? (
          <PokemonErrorBoundary
            onReset={handleReset}
            resetKeys={[pokemonResource]}
          >
            <React.Suspense
              fallback={<PokemonInfoFallback name={pokemonName} />}
            >
              <PokemonInfo pokemonResource={pokemonResource} />
            </React.Suspense>
          </PokemonErrorBoundary>
        ) : (
            'Submit a pokemon'
          )}
      </div>
    </div>
  )
}

function AppWithProviders() {
  return <PokemonCacheProvider><App /></PokemonCacheProvider>
}

export default AppWithProviders
