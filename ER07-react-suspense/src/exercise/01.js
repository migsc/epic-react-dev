// Simple Data-fetching
// http://localhost:3000/isolated/exercise/01.js

import * as React from 'react'
import { PokemonDataView, PokemonErrorBoundary, PokemonInfoFallback, fetchPokemon } from '../pokemon'
import { createResource } from '../utils'

// 💰 use it like this:
// fetchPokemon(pokemonName).then(handleSuccess, handleFailure)


// My implementation
// function createResource(promise) {
//   let data, error;

//   promise.then(d => (data = d), e => (error = e))

//   return {
//     read: () => {
//       if (error) {

//         throw error
//       }

//       if (!data) {
//         throw promise
//       }

//       return data;
//     }
//   }
// }

const pokemonResource = createResource(fetchPokemon('pikachu'))

// // We don't need the app to be mounted to know that we want to fetch the pokemon
// // named "pikachu" so we can go ahead and do that right here.
// let pokemon, error
// let pokemonPromise = fetchPokemon('pikdachu')
// pokemonPromise.then(data => (pokemon = data), err => (error = err))

function PokemonInfo() {
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

function App() {
  return (
    <div className="pokemon-info-app">
      <div className="pokemon-info">
        <React.Suspense fallback={<PokemonInfoFallback />}>
          <PokemonErrorBoundary>
            <PokemonInfo />
          </PokemonErrorBoundary>
        </React.Suspense>
      </div>
    </div>
  )
}

export default App
