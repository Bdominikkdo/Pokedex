import axios from "axios";

const api = axios.create({
  baseURL: "https://pokeapi.co/api/v2",
});

export const getPokemons = async (limit = 40, offset = 0) => {
  const response = await api.get("/pokemon", {
    params: { limit, offset },
  });

  return response.data.results;
};


export const getPokemonsWithDetails = async (limit = 40, offset = 0) => {
  try {
    const basicList = await getPokemons(limit, offset);

    const requests = basicList.map((pokemon) =>
      axios.get(pokemon.url)
    );

    const responses = await Promise.all(requests);

    // 3. Retornar només les dades
    return responses.map((res) => res.data);
  } catch (error) {
    console.error("Error obtenint detalls dels Pokémon:", error);
    throw error;
  }
};