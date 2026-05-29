import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getPokemonsWithDetails } from "../api/Api";

export default function PokemonList() {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPokemons = async () => {
      try {
        const data = await getPokemonsWithDetails(10200);
        setPokemons(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadPokemons();
  }, []);

  if (loading) return <p>Carregant...</p>;

  return (
    <section>
      <h2>Llistat de Pokémon</h2>

      <div className="grid">
        {pokemons.map((pokemon) => (
          <Link
            key={pokemon.id}
            to={`/pokemon/${pokemon.name}`}
            className="card"
          >
            <img
              src={pokemon.sprites.front_default}
              alt={pokemon.name}
            />
            <p>{pokemon.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}