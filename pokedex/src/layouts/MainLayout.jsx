import { useState } from "react";
import { Outlet } from "react-router-dom";
import "./MainLayout.css";

export default function MainLayout() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [totalPokemon, setTotalPokemon] = useState(0);
  const [selectPressed, setSelectPressed] = useState(false);
  const [isShiny, setIsShiny] = useState(false);

  const handlePrev = () => {
    if (totalPokemon === 0) return;
    setActiveIndex((prev) => (prev - 1 + totalPokemon) % totalPokemon);
  };

  const handleNext = () => {
    if (totalPokemon === 0) return;
    setActiveIndex((prev) => (prev + 1) % totalPokemon);
  };

  const handleSelect = () => {
    if (totalPokemon === 0) return;
    setSelectPressed(true);
  };

  const toggleShiny = () => {
    setIsShiny((prev) => !prev);
  };

  return (
    <div className="pokedex-frame">
      <div className="pokedex-top-bar">
        <div className="main-sensor"></div>
        <div className="small-sensors">
          <div className="sensor red"></div>
          <div className="sensor yellow"></div>
          <div className="sensor green"></div>
        </div>
      </div>

      <div className="pokedex-screen">
        <main className="content-area">
          <Outlet context={{ activeIndex, setActiveIndex, setTotalPokemon, selectPressed, setSelectPressed, isShiny }} />
        </main>
      </div>

      <div className="pokedex-footer">
        <div className="pokedex-controls">
          <div className="arrow-left" onClick={handlePrev}></div>
          <div className="pokedex-button-sprite" onClick={handleSelect}></div>          
          <div className="arrow-right" onClick={handleNext}></div>
        </div>
        
        <div className="footer-bottom-row">
          <div className="dot-pattern"></div>
          <button 
            className={`shiny-toggle-button ${isShiny ? "active" : ""}`} 
            onClick={toggleShiny}
          >
            {isShiny ? "✨ SHINY" : "⭐ NORMAL"}
          </button>
        </div>
      </div>
    </div>
  );
}