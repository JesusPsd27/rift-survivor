window.RS = window.RS || {};

/** Campeón = stats + arma inicial. Las armas se stackean en la run. */
RS.CHAMPIONS = [
  {
    id: "ashe",
    name: "Ashe",
    color: "#4aa3ff",
    blurb: "Empieza con Arco Recurvo",
    hp: 100,
    speed: 210,
    startWeapons: ["recurve_bow"],
  },
  {
    id: "garen",
    name: "Garen",
    color: "#DAA47B",
    blurb: "Empieza con Ceniza de Bami",
    hp: 140,
    speed: 200,
    startWeapons: ["bamis_cinder"],
  },
  {
    id: "ahri",
    name: "Ahri",
    color: "#ed5c5c",
    blurb: "Empieza con Códice Diabólico",
    hp: 95,
    speed: 225,
    startWeapons: ["fiendish_codex"],
  },
];
