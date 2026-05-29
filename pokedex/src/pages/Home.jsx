import { useState, useEffect } from "react";
import { useOutletContext } from "react-router";

export default function Home() {
  const [pokemon, setPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [specialFilter, setSpecialFilter] = useState("all");
  const [sortBy, setSortBy] = useState("id-asc");

  const { activeIndex, setActiveIndex, setTotalPokemon, selectPressed, setSelectPressed, isShiny } = useOutletContext();

  const legendaryIds = [
    144, 145, 146, 150, 243, 244, 245, 249, 250, 377, 378, 379, 380, 381, 382, 383, 384,
    480, 481, 482, 483, 484, 485, 486, 487, 488, 638, 639, 640, 641, 642, 643, 644, 645,
    646, 716, 717, 718, 772, 773, 785, 786, 787, 788, 789, 790, 791, 792, 800, 888, 889,
    890, 891, 892, 894, 895, 896, 897, 898, 905, 1001, 1002, 1003, 1004, 1007, 1008,
    1014, 1015, 1016, 1017, 1024
  ];

  const mythicalIds = [
    151, 251, 385, 386, 489, 490, 491, 492, 493, 494, 647, 648, 649, 719, 720, 721,
    801, 802, 807, 808, 809, 893, 1025
  ];

  useEffect(() => {
    fetch("https://pokeapi.co/api/v2/pokemon?limit=1025")
      .then((res) => res.json())
      .then(async (data) => {
        const fullData = await Promise.all(
          data.results.map(async (p) => {
            const res = await fetch(p.url);
            return res.json();
          })
        );
        setPokemon(fullData);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  const getRegionByPokemonId = (id) => {
    if (id >= 1 && id <= 151) return "kanto";
    if (id >= 152 && id <= 251) return "johto";
    if (id >= 252 && id <= 386) return "hoenn";
    if (id >= 387 && id <= 493) return "sinnoh";
    if (id >= 494 && id <= 649) return "unova";
    if (id >= 650 && id <= 721) return "kalos";
    if (id >= 722 && id <= 809) return "alola";
    if (id >= 810 && id <= 898) return "galar";
    if (id >= 899 && id <= 1025) return "paldea";
    return "unknown";
  };

  const filteredPokemon = pokemon
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toString().includes(searchQuery);

      const matchesType =
        selectedType === "all" ||
        p.types.some((t) => t.type.name === selectedType);

      const pokemonRegion = getRegionByPokemonId(p.id);
      const matchesRegion = selectedRegion === "all" || pokemonRegion === selectedRegion;

      let matchesSpecial = true;
      if (specialFilter === "legendary") {
        matchesSpecial = legendaryIds.includes(p.id);
      } else if (specialFilter === "mythical") {
        matchesSpecial = mythicalIds.includes(p.id);
      }

      return matchesSearch && matchesType && matchesRegion && matchesSpecial;
    })
    .sort((a, b) => {
      if (sortBy === "id-asc") return a.id - b.id;
      if (sortBy === "id-desc") return b.id - a.id;
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      return b.name.localeCompare(a.name);
    });

  useEffect(() => {
    setTotalPokemon(filteredPokemon.length);
    if (activeIndex >= filteredPokemon.length) {
      setActiveIndex(0);
    }
  }, [filteredPokemon.length, activeIndex, setTotalPokemon, setActiveIndex]);

  useEffect(() => {
    if (selectPressed && filteredPokemon.length > 0) {
      setViewMode((prev) => (prev === "list" ? "detail" : "list"));
      setSelectPressed(false);
    }
  }, [selectPressed, filteredPokemon, setSelectPressed]);

  useEffect(() => {
    if (viewMode === "list") {
      const elementoActivo = document.querySelector(".pokemon-item.active");
      if (elementoActivo) {
        elementoActivo.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [activeIndex, viewMode]);

  if (loading) return <p style={{ textAlign: "center", padding: "20px" }}>Cargando Pokédex Nacional...</p>;

  const currentPokemon = filteredPokemon[activeIndex];

  if (viewMode === "detail" && currentPokemon) {
    const officialArtwork = isShiny
      ? currentPokemon.sprites.other["official-artwork"]?.front_shiny || currentPokemon.sprites.front_shiny
      : currentPokemon.sprites.other["official-artwork"]?.front_default || currentPokemon.sprites.front_default;

    return (
      <div className="pokemon-detail-view">
        <button className="back-screen-btn" onClick={() => setViewMode("list")}>◀ Volver</button>

        <div className="detail-header">
          <span className="detail-id">#{currentPokemon.id}</span>
          <h2 className="detail-name">{currentPokemon.name.replace("-", " ")} {isShiny && "✨"}</h2>
        </div>

        <div className="detail-image-container">
          <img src={officialArtwork} alt={currentPokemon.name} className="detail-pokemon-img" />
        </div>

        <div className="detail-types">
          {currentPokemon.types.map((t) => (
            <span key={t.type.name} className={`type-badge ${t.type.name}`}>{t.type.name}</span>
          ))}
          {legendaryIds.includes(currentPokemon.id) && <span className="type-badge legendary">Legendario</span>}
          {mythicalIds.includes(currentPokemon.id) && <span className="type-badge mythical">Mítico</span>}
        </div>

        <div className="stats-board">
          {currentPokemon.stats.map((s) => {
            let statName = s.stat.name;
            if (statName === "special-attack") statName = "Sp. Atk";
            if (statName === "special-defense") statName = "Sp. Def";
            const barPercentage = Math.min((s.base_stat / 150) * 100, 100);

            return (
              <div key={s.stat.name} className="stat-row">
                <span className="stat-label">{statName}</span>
                <div className="stat-bar-bg">
                  <div className="stat-bar-fill" style={{ width: `${barPercentage}%` }}></div>
                </div>
                <span className="stat-number">{s.base_stat}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="screen-container-relative" style={{ position: "relative", height: "100%", overflowY: "auto" }}>
      
      <button className="sidebar-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? "✕ Cerrar" : "🔍 Filtrar"}
      </button>

      <div className={`filter-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <h3>Filtros Pokédex</h3>
        
        <div style={{ fontSize: '10px', background: '#e0e0e0', padding: '6px', borderRadius: '5px', lineHeight: '1.4' }}>
          <div><strong>Resultados:</strong> {filteredPokemon.length}</div>
          <div><strong>Legendarios:</strong> {filteredPokemon.filter(p => legendaryIds.includes(p.id)).length}</div>
          <div><strong>Míticos:</strong> {filteredPokemon.filter(p => mythicalIds.includes(p.id)).length}</div>
        </div>

        <div className="filter-group">
          <label>Buscador:</label>
          <input 
            type="text" 
            placeholder="Nombre o ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Rareza:</label>
          <select value={specialFilter} onChange={(e) => setSpecialFilter(e.target.value)}>
            <option value="all">Ver Todos</option>
            <option value="legendary">Legendarios 👑</option>
            <option value="mythical">Míticos ✨</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Región:</label>
          <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}>
            <option value="all">Todas (Gens 1-9)</option>
            <option value="kanto">Kanto (Gen 1)</option>
            <option value="johto">Johto (Gen 2)</option>
            <option value="hoenn">Hoenn (Gen 3)</option>
            <option value="sinnoh">Sinnoh (Gen 4)</option>
            <option value="unova">Teselia / Unova (Gen 5)</option>
            <option value="kalos">Kalos (Gen 6)</option>
            <option value="alola">Alola (Gen 7)</option>
            <option value="galar">Galar (Gen 8)</option>
            <option value="paldea">Paldea (Gen 9)</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Tipo:</label>
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
            <option value="all">Todos los tipos</option>
            <option value="grass">Planta</option>
            <option value="poison">Veneno</option>
            <option value="fire">Fuego</option>
            <option value="flying">Volador</option>
            <option value="water">Agua</option>
            <option value="bug">Bicho</option>
            <option value="normal">Normal</option>
            <option value="electric">Eléctrico</option>
            <option value="ground">Tierra</option>
            <option value="fairy">Hada</option>
            <option value="fighting">Lucha</option>
            <option value="psychic">Psíquico</option>
            <option value="rock">Roca</option>
            <option value="steel">Acero</option>
            <option value="ice">Hielo</option>
            <option value="ghost">Fantasma</option>
            <option value="dragon">Dragón</option>
            <option value="dark">Siniestro</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Ordenación:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="id-asc">Nº Pokedex (Asc)</option>
            <option value="id-desc">Nº Pokedex (Desc)</option>
            <option value="name-asc">Nombre (A - Z)</option>
            <option value="name-desc">Nombre (Z - A)</option>
          </select>
        </div>

        <button className="clear-filters-btn" onClick={() => {
          setSearchQuery("");
          setSelectedType("all");
          setSelectedRegion("all");
          setSpecialFilter("all");
          setSortBy("id-asc");
        }}>Resetear</button>
      </div>

      {filteredPokemon.length === 0 ? (
        <p style={{ textAlign: "center", paddingTop: "50px", color: "#666", fontSize: "13px" }}>No hay registros correspondientes.</p>
      ) : (
        <div className="pokemon-list">
          {filteredPokemon.map((p, index) => (
            <div 
              key={p.id} 
              className={`pokemon-item ${index === activeIndex ? "active" : ""} ${legendaryIds.includes(p.id) ? "is-legendary" : ""} ${mythicalIds.includes(p.id) ? "is-mythical" : ""}`}
              onClick={() => {
                setActiveIndex(index);
                setViewMode("detail");
              }}
            >
              <img 
                src={isShiny ? p.sprites.front_shiny || p.sprites.front_default : p.sprites.front_default} 
                alt={p.name} 
                style={{ width: "70px", height: "70px", objectFit: "contain" }} 
              />
              <p style={{ textTransform: "capitalize", fontSize: "11px", margin: "5px 0", textAlign: "center" }}>
                <strong>#{p.id}</strong><br/>
                {p.name.replace("-", " ")} {isShiny && "✨"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}