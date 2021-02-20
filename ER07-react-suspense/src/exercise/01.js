// Simple Data-fetching
// http://localhost:3000/isolated/exercise/01.js

import * as React from 'react'
import { PokemonDataView, fetchPokemon } from '../pokemon'

// 💰 use it like this:
// fetchPokemon(pokemonName).then(handleSuccess, handleFailure)



// We don't need the app to be mounted to know that we want to fetch the pokemon
// named "pikachu" so we can go ahead and do that right here.
let pokemon
let pokemonPromise = fetchPokemon('pikachu')
pokemonPromise.then(data => (pokemon = data))

function PokemonInfo() {
  if (!pokemon) {
    throw pokemonPromise
  }

  return (
    <div>
      <div className="pokemon-info__img-wrapper">
        <img src={pokemon.image} alt={pokemon.name} />
      </div>
      <PokemonDataView pokemon={pokemon} />
    </div>
  )
}

function App() {
  return (
    <div className="pokemon-info-app">
      <div className="pokemon-info">
        {/* 🐨 Wrap the PokemonInfo component with a React.Suspense component with a fallback */}
        <React.Suspense fallback={<span>Loading...</span>}>
          <PokemonInfo />
        </React.Suspense>
      </div>
    </div>
  )
}

export default App
