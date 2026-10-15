// ======================================================
// CONFIGURATION DE LA JOURNEE
// ======================================================

const jour = document.body.dataset.jour;

if (!jour) {
  console.error("Aucun jour défini dans l'attribut data-jour du <body>.");
}

const dossierDonnees = `Data/${jour}`;
// ======================================================
// EMOJIS SVG COHERENTS
// ======================================================

function appliquerEmojiSVG(cible) {

  if (!window.twemoji) {
    return;
  }

  window.twemoji.parse(
    cible || document.body,
    {
      base:
        "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/",
      folder: "svg",
      ext: ".svg"
    }
  );
}


function chargerEmojiSVG() {

  // Déjà chargé
  if (window.twemoji) {

    appliquerEmojiSVG(
      document.body
    );

    return;
  }


  const script =
    document.createElement("script");

  script.src =
    "https://cdn.jsdelivr.net/npm/twemoji@14.0.2/dist/twemoji.min.js";

  script.crossOrigin =
    "anonymous";


  script.onload = function() {

    appliquerEmojiSVG(
      document.body
    );

  };


  script.onerror = function() {

    console.warn(
      "Twemoji indisponible : conservation des emojis natifs."
    );

  };


  document.head.appendChild(
    script
  );

}


if (document.readyState === "loading") {

  document.addEventListener(
    "DOMContentLoaded",
    chargerEmojiSVG,
    {
      once: true
    }
  );

} else {

  chargerEmojiSVG();

}

// ======================================================
// CARTE
// ======================================================

const map = L.map("map").setView(
  [37.56, 126.98],
  11
);

map.on(
  "popupopen",
  function(event) {

    appliquerEmojiSVG(
      event.popup.getElement()
    );

  }
);

// ======================================================
// CALQUE DES HALOS DES TRAJETS
// ======================================================

map.createPane("trajetsHalo");

map.getPane("trajetsHalo").style.zIndex = 390;
map.getPane("trajetsHalo").style.pointerEvents = "none";

// ======================================================
// FOND DE CARTE - ALIDADE SMOOTH
// ======================================================

L.tileLayer(
  "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png", {
    maxZoom: 20,
    attribution: '&copy; Stadia Maps ' +
      '&copy; OpenMapTiles ' +
      '&copy; OpenStreetMap contributors'
  }
).addTo(map);

// ======================================================
// AFFICHAGE DES TYPES DE LIEUX
// ======================================================

function obtenirInfosLieu(type) {

  const types = {

    Aeroport: {
      icone: "✈️",
      label: "Aéroport",
      classe: "aeroport"
    },

    Gare: {
      icone: "🚆",
      label: "Gare",
      classe: "gare"
    },

    Metro: {
      icone: "🚇",
      label: "Métro",
      classe: "metro"
    },

    Hotel: {
      icone: "🛏️",
      label: "Hébergement",
      classe: "hotel"
    },

    Convenience: {
      icone: "🏪",
      label: "Supérette",
      classe: "convenience"
    },

    Boutique: {
      icone: "🛍️",
      label: "Boutique",
      classe: "boutique"
    },

    Palais: {
      icone: "🏯",
      label: "Palais",
      classe: "palais"
    },

    Restaurant: {
      icone: "🍽️",
      label: "Restaurant",
      classe: "restaurant"
    },

    CentreCommercial: {
      icone: "🏬",
      label: "Centre commercial",
      classe: "centrecommercial"
    },

    Temple: {
      icone: "☸️",
      label: "Temple",
      classe: "temple"
    },

    Quartier: {
      icone: "🎨",
      label: "Quartier",
      classe: "quartier"
    },

    Parc: {
      icone: "🌳",
      label: "Parc",
      classe: "parc"
    },
	
	Ile: {
      icone: "🏝️",
      label: "Île",
      classe: "ile"
    },

    Jardin: {
      icone: "🌿",
      label: "Jardin",
      classe: "jardin"
    },

    Site: {
      icone: "📍",
      label: "Site",
      classe: "site"
    },

    Observatoire: {
      icone: "🔭",
      label: "Observatoire",
      classe: "observatoire"
    },

    Telepherique: {
      icone: "🚡",
      label: "Téléphérique",
      classe: "telepherique"
    },

    ArretBus: {
      icone: "🚏",
      label: "Arrêt de bus",
      classe: "arretbus"
    },

    Tram: {
      icone: "🚋",
      label: "Tram",
      classe: "tram"
    },

    Port: {
      icone: "⚓",
      label: "Terminal ferry",
      classe: "port"
    },

    Ville: {
      icone: "📍",
      label: "Ville",
      classe: "ville"
    }

  };

  return types[type] || {
    icone: "📍",
    label: type || "Lieu",
    classe: "lieu"
  };
}

// ======================================================
// LIEUX
// ======================================================
// Stockage des marqueurs pour pouvoir les retrouver
const marqueursLieux = {};
let marqueurSelectionne = null;

// ======================================================
// GESTION VISUELLE DU MARQUEUR ACTIF
// ======================================================

function deselectionnerMarqueurActif() {

  if (!marqueurSelectionne) {
    return;
  }

  marqueurSelectionne
    .getElement()
    ?.classList.remove("selectionne");

  marqueurSelectionne.setZIndexOffset(0);

  marqueurSelectionne = null;
}


function selectionnerMarqueur(marker) {

  deselectionnerMarqueurActif();

  marqueurSelectionne = marker;

  // Toujours afficher le marqueur actif
  // au-dessus des autres marqueurs.
  marker.setZIndexOffset(1000);

  marker
    .getElement()
    ?.classList.add("selectionne");
}

// ======================================================
// DESTINATION D'UN TRAJET
// ======================================================

function selectionnerDestinationTrajet(id) {

  const etapeProgramme =
    document.querySelector(
      `[data-trajet="${id}"]`
    );

  if (!etapeProgramme) {
    return;
  }

  const ordreDestination =
    etapeProgramme.dataset.lieu;

  if (!ordreDestination) {
    return;
  }

  const markerDestination =
    marqueursLieux[ordreDestination];

  if (!markerDestination) {
    return;
  }

  selectionnerMarqueur(
    markerDestination
  );
}

let limitesJournee = null;
fetch(`${dossierDonnees}/lieux.geojson`)

  .then(response => response.json())

  .then(data => {
	  
	      // ------------------------------------------
    // Repérer les lieux situés exactement
    // au même endroit
    // ------------------------------------------

    const nombreParCoordonnee = {};
    const indexParCoordonnee = {};

    data.features.forEach(function(feature) {

      if (!feature.geometry ||
          feature.geometry.type !== "Point") {
        return;
      }

      const coords = feature.geometry.coordinates;

      const cle =
        coords[0].toFixed(6) + "," +
        coords[1].toFixed(6);

      nombreParCoordonnee[cle] =
        (nombreParCoordonnee[cle] || 0) + 1;

    });

    const lieux = L.geoJSON(data, {

      // ------------------------------------------
      // Marqueurs numérotés
      // ------------------------------------------

            pointToLayer: function(feature, latlng) {

        const ordre = feature.properties.Ordre;

        const categorie =
          feature.properties.Type || "Lieu";

        const classeCategorie =
          "lieu-" + categorie.toLowerCase();


        // ------------------------------------------
        // Décalage visuel des marqueurs superposés
        // ------------------------------------------

        const cle =
          latlng.lng.toFixed(6) + "," +
          latlng.lat.toFixed(6);

        const total =
          nombreParCoordonnee[cle] || 1;

        const index =
          indexParCoordonnee[cle] || 0;

        indexParCoordonnee[cle] = index + 1;


		const decalages = [
			[0, 0],
			[20, 0],
			[-20, 0],
			[0, 20],
			[0, -20]
		];

        const decalage =
          total > 1
            ? decalages[index % decalages.length]
            : [0, 0];


        const icone = L.divIcon({

          className:
            "numero-lieu " +
            classeCategorie,

          html:
            "<div>" +
            ordre +
            "</div>",

		iconSize: [34, 34],

		iconAnchor: [
			17 - decalage[0],
			17 - decalage[1]
		]


        });

        const marker = L.marker(
          latlng, {
            icon: icone
          }
        );
        marker.on("click", function() {
          selectionnerLieuDepuisCarte(
            ordre,
            marker
          );
        });

        // On mémorise le marqueur grâce à son numéro d'ordre
        marqueursLieux[ordre] = marker;

        return marker;

      },

      // ------------------------------------------
      // Popup des lieux
      // ------------------------------------------

      // ------------------------------------------
      // Popup des lieux
      // ------------------------------------------

      onEachFeature: function(feature, layer) {

        const nom =
          feature.properties.Nom;

        const ordre =
          feature.properties.Ordre;

        const type =
          feature.properties.Type || "Lieu";
		  
		const sousType =
          feature.properties.SousType;

        const ref =
          feature.properties.Ref;

        const note =
          feature.properties.Note;

        const adresse =
          feature.properties.Adresse;

        const elevation =
          feature.properties.ELEVATION;

        const infosLieu =
          obtenirInfosLieu(type);
		  
		          let detailsLieu = "";


        if (ref) {

          detailsLieu += `
            <span class="popup-badge">
              ${type === "Metro" ? "🚇" : type === "Tram" ? "🚋" : "🔖"} ${ref}
            </span>
          `;

        }


        if (sousType) {

          detailsLieu += `
            <span class="popup-badge">
              ${sousType}
            </span>
          `;

        }


        if (elevation) {

          detailsLieu += `
            <span class="popup-badge">
              ⛰ ${elevation} m
            </span>
          `;

        }


        if (detailsLieu) {

          detailsLieu = `
            <div class="popup-trajet-infos">
              ${detailsLieu}
            </div>
          `;

        }


        let informationsLieu = "";


        if (note) {

          informationsLieu += `
            <div class="popup-lieu-note">
              ${note}
            </div>
          `;

        }


        if (adresse) {

          informationsLieu += `
            <div class="popup-lieu-adresse">
              📍 ${adresse}
            </div>
          `;

        }

        layer.bindPopup(`
        <div class="popup-carte">

            <div class="popup-transport">

                <div class="popup-transport-icone popup-lieu-icone ${infosLieu.classe}">
					${infosLieu.icone}
				</div>

                <div class="popup-transport-contenu">

                    <div class="popup-etiquette popup-etiquette-lieu ${infosLieu.classe}">
						${infosLieu.label}
					</div>

					<div class="popup-titre">
						${nom}
					</div>

				</div>

			</div>

						${detailsLieu}

						${informationsLieu}

            <div class="popup-lieu-etape">
              Étape ${ordre}
            </div>

        </div>
    `);

      }

    }).addTo(map);

    // Zoom automatique sur tous les lieux
    limitesJournee = lieux.getBounds();
    map.fitBounds(
      limitesJournee, {
        padding: [30, 30]
      }
    );

  })

  .catch(error => {

    console.error(
      "Erreur lors du chargement des lieux :",
      error
    );

  });

// ======================================================
// TRAJETS
// ======================================================

const trajetsCarte = {};
const halosTrajets = {};

let trajetSelectionne = null;


// ======================================================
// ICONE DES TRANSPORTS
// ======================================================

function obtenirIconeTransport(type) {

  if (type === "Marche") {
    return "🚶";
  }

  if (type === "Metro") {
    return "🚇";
  }

  if (type === "Train") {
    return "🚆";
  }

  if (type === "Bus") {
    return "🚌";
  }

  if (type === "Telepherique") {
    return "🚡";
  }

  if (type === "Tram") {
    return "🚋";
  }

  if (type === "Ferry") {
    return "🚢";
  }

  return "📍";
}


// ======================================================
// STYLE DES TRAJETS
// ======================================================

function obtenirStyleTrajet(feature) {

  const type = feature.properties.Type;

  const styles = {

    Marche: {
      color: "#7C3AED",
      weight: 5,
      opacity: 0.9,
      dashArray: "4, 7"
    },

    Metro: {
      color: "#16A34A",
      weight: 5,
      opacity: 0.9
    },

    Train: {
      color: "#2563EB",
      weight: 6,
      opacity: 0.9
    },

    Bus: {
      color: "#F59E0B",
      weight: 5,
      opacity: 0.9,
      dashArray: "10, 5"
    },

    Tram: {
      color: "#D97706",
      weight: 5,
      opacity: 0.9
    },

    Ferry: {
      color: "#0284C7",
      weight: 5,
      opacity: 0.9,
      dashArray: "12, 5"
    },

    Telepherique: {
      color: "#0891B2",
      weight: 5,
      opacity: 0.9
    }

  };

  const style = {
    ...(styles[type] || {
      color: "#555555",
      weight: 4,
      opacity: 0.9
    })
  };


  // ------------------------------------------
  // TRAJET ALTERNATIF
  // ------------------------------------------

  const option =
    feature.properties.Option;

  const priorite =
    Number(
      feature.properties.Priorite || 0
    );


  // Une alternative non prioritaire
  // devient pointillée sur la carte.
  //
  // Si le type possède déjà ses propres
  // pointillés (marche, bus, ferry),
  // on les conserve.

  if (
    option &&
    priorite !== 1 &&
    !style.dashArray
  ) {

    style.dashArray = "8, 6";

  }


  return {
    ...style,

    lineCap: "round",
    lineJoin: "round"
  };
}


// ======================================================
// HALO BLANC SOUS LES TRAJETS
// ======================================================

function obtenirStyleHalo(feature) {

  const styleTrajet =
    obtenirStyleTrajet(feature);

  return {

    color: "#FFFFFF",

    // 4 px plus large =
    // environ 2 px de blanc de chaque côté
    weight: styleTrajet.weight + 4,

    opacity: 0.95,

    // On conserve les pointillés
    // pour Marche / Bus / Ferry
    dashArray:
      styleTrajet.dashArray || null,

    lineCap: "round",
    lineJoin: "round"

  };
}


// ======================================================
// GESTION VISUELLE DES HALOS
// ======================================================

function reinitialiserHalosTrajets() {

  Object.values(halosTrajets).forEach(
    function(halo) {

      halo.setStyle({

        weight:
          halo.options.weightOriginal,

        opacity: 0.95

      });

    }
  );

}


function attenuerHalosTrajets() {

  Object.values(halosTrajets).forEach(
    function(halo) {

      halo.setStyle({

        weight:
          halo.options.weightOriginal,

        opacity: 0.25

      });

    }
  );

}


function mettreEnAvantHalo(
  id,
  bonusEpaisseur
) {

  const halo =
    halosTrajets[id];

  if (!halo) {
    return;
  }

  halo.setStyle({

    weight:
      halo.options.weightOriginal +
      bonusEpaisseur,

    opacity: 1

  });

  halo.bringToFront();

}

fetch(`${dossierDonnees}/trajets.geojson`)

  .then(response => response.json())

  .then(data => {

        // ------------------------------------------
    // HALO BLANC
    // ------------------------------------------

    L.geoJSON(data, {

      pane: "trajetsHalo",

      interactive: false,

      style: obtenirStyleHalo,

      onEachFeature: function(feature, layer) {

        const id =
          feature.properties.ID;

        layer.options.weightOriginal =
          layer.options.weight;

        if (id) {
          halosTrajets[id] = layer;
        }

      }

    }).addTo(map);


    // ------------------------------------------
    // TRAJETS COLORES
    // ------------------------------------------

    L.geoJSON(data, {

      style: obtenirStyleTrajet,
      // ------------------------------------------
      // Popup des trajets
      // ------------------------------------------

      onEachFeature: function(feature, layer) {

        const p = feature.properties;

        const id = p.ID;
        const nom = p.Nom || id || "Trajet";
        const type = p.Type || "Trajet";

        const origine = p.Origine;
        const destination = p.Destin;

        const ligne = p.Ligne;
        const direction = p.Direction;
        const duree = p.DureeMin;

        const option = p.Option;
        const priorite = p.Priorite;

        const iconeTransport =
          obtenirIconeTransport(type);

        // ------------------------------------------
        // Mémoriser le trajet
        // ------------------------------------------

        if (id) {

          trajetsCarte[id] = layer;

          layer.on("click", function() {

            selectionnerTrajetDepuisCarte(
              id,
              layer
            );

          });

        }

        // ------------------------------------------
        // Construire les détails
        // ------------------------------------------

        let contenuDetails = "";

        // Origine → destination

        if (origine && destination) {

          contenuDetails += `
            <div class="popup-trajet-parcours">
                ${origine} → ${destination}
            </div>
        `;

        }

        // Badges

        let infos = "";

        if (ligne) {

          infos += `
            <span class="popup-badge">
                ${iconeTransport} ${ligne}
            </span>
        `;

        }

        if (duree) {

          infos += `
            <span class="popup-badge">
                ⏱ ${duree} min
            </span>
        `;

        }

        if (direction) {

          infos += `
            <span class="popup-badge">
                ➜ ${direction}
            </span>
        `;

        }

        if (infos) {

          contenuDetails += `
            <div class="popup-trajet-infos">
                ${infos}
            </div>
        `;

        }

        // Plan A / B

        if (option) {

          contenuDetails += `
            <div class="popup-trajet-option">
                PLAN ${option}${
                    priorite == 1
                        ? " • PRIORITAIRE"
                        : ""
                }
            </div>
        `;

        }

        // ------------------------------------------
        // Popup
        // ------------------------------------------

        layer.bindPopup(`
        <div class="popup-carte">

            <div class="popup-transport">

                <div class="popup-transport-icone">
                    ${iconeTransport}
                </div>

                <div class="popup-transport-contenu">

                    <div class="popup-etiquette">
                        ${type}
                    </div>

                    <div class="popup-titre">
                        ${nom}
                    </div>

                </div>

            </div>

            ${contenuDetails}

        </div>
    `);

      }

    }).addTo(map);

  })

  .catch(error => {

    console.error(
      "Erreur lors du chargement des trajets :",
      error
    );

  });

function selectionnerEtape(element) {

  document.querySelectorAll(".etape-selectionnee").forEach(function(etape) {
    etape.classList.remove("etape-selectionnee");
  });

  element.classList.add("etape-selectionnee");
}
// ======================================================
// ETAPES OPTIONNELLES
// ======================================================

function identifierEtapesOptionnelles() {

  document
    .querySelectorAll(
      ".etape-carte, .etape-liaison"
    )
    .forEach(function(etape) {

      const type =
        etape.querySelector(".type-etape")
          ?.textContent || "";

      const badges =
        Array.from(
          etape.querySelectorAll(".badge")
        )
        .map(function(badge) {
          return badge.textContent;
        })
        .join(" ");

      const texte =
        (type + " " + badges)
          .toLowerCase();

      if (texte.includes("option")) {

        etape.classList.add(
          "etape-optionnelle"
        );

      }

    });

}


identifierEtapesOptionnelles();

// ======================================================
// REINITIALISER LES SELECTIONS
// ======================================================

function reinitialiserSelections() {

  // Programme
  document
    .querySelectorAll(".etape-selectionnee")
    .forEach(function(etape) {
      etape.classList.remove("etape-selectionnee");
    });

   // Marqueur sélectionné
  deselectionnerMarqueurActif();

  // Trajets
  Object.values(trajetsCarte).forEach(function(trajet) {

    trajet.setStyle({
      opacity: 0.9
    });

    if (trajet.options.weightOriginal) {

      trajet.setStyle({
        weight: trajet.options.weightOriginal
      });

    }

  });
  
  reinitialiserHalosTrajets();

  trajetSelectionne = null;
}
// ======================================================
// SELECTION D'UN LIEU DEPUIS LA CARTE
// ======================================================

function selectionnerLieuDepuisCarte(ordre, marker) {

  // Réinitialiser les anciennes sélections
  reinitialiserSelections();

  // Mettre le marqueur en évidence
  selectionnerMarqueur(marker);

  // Chercher l'étape correspondante dans le programme
  const etapeProgramme =
    document.querySelector(
      `[data-lieu="${ordre}"]`
    );

  // Certains lieux n'ont pas forcément
  // une étape dédiée dans le programme
  if (!etapeProgramme) {
    return;
  }

  // Sélectionner l'étape
  selectionnerEtape(
    etapeProgramme
  );

  // Faire défiler doucement jusqu'à elle
  etapeProgramme.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}

// ======================================================
// SELECTION D'UN TRAJET DEPUIS LA CARTE
// ======================================================

function selectionnerTrajetDepuisCarte(id, trajet) {

  // ------------------------------------------
  // Réinitialiser l'ancienne sélection
  // ------------------------------------------

  reinitialiserSelections();

  // ------------------------------------------
  // Trouver les trajets associés
  // ------------------------------------------

  const idsAssocies =
    obtenirTrajetsAssocies(id);

  const trajetsAssocies =
    idsAssocies
    .map(function(idTrajet) {
      return trajetsCarte[idTrajet];
    })
    .filter(Boolean);

  if (trajetsAssocies.length === 0) {
    return;
  }

  // ------------------------------------------
  // Atténuer les autres trajets
  // ------------------------------------------

  Object.values(trajetsCarte).forEach(
    function(autreTrajet) {

      // Sauvegarder l'épaisseur originale
      if (!autreTrajet.options.weightOriginal) {

        autreTrajet.options.weightOriginal =
          autreTrajet.options.weight;

      }

      // Remettre l'épaisseur normale
      autreTrajet.setStyle({

        weight: autreTrajet.options.weightOriginal,

        opacity: 0.25

      });

    }
  );
  attenuerHalosTrajets();

  idsAssocies.forEach(
    function(idAssocie) {

      mettreEnAvantHalo(
        idAssocie,
        3
      );

    }
  );
  // ------------------------------------------
  // Mettre le groupe en évidence
  // ------------------------------------------

  trajetsAssocies.forEach(
    function(trajetAssocie) {

      trajetAssocie.setStyle({

        weight: trajetAssocie.options.weightOriginal + 3,

        opacity: 1

      });

      trajetAssocie.bringToFront();

    }
  );

  // ------------------------------------------
  // Mettre le trajet cliqué davantage en avant
  // ------------------------------------------

  trajetSelectionne = trajet;

  mettreEnAvantHalo(
    id,
    5
  );

  trajet.setStyle({

    weight: trajet.options.weightOriginal + 5,

    opacity: 1

  });

  trajet.bringToFront();

  // ------------------------------------------
  // Trouver l'étape correspondante
  // dans le programme
  // ------------------------------------------

  const etapeProgramme =
    document.querySelector(
      `[data-trajet="${id}"]`
    );

  if (!etapeProgramme) {
    return;
  }
  
  // Mettre aussi en évidence
  // le marqueur de destination

  selectionnerDestinationTrajet(id);

  // ------------------------------------------
  // Sélectionner l'étape du programme
  // ------------------------------------------

  selectionnerEtape(
    etapeProgramme
  );

  // ------------------------------------------
  // Faire défiler jusqu'à l'étape
  // ------------------------------------------

  etapeProgramme.scrollIntoView({

    behavior: "smooth",

    block: "center"

  });

}

// ======================================================
// ZOOM SUR UN LIEU DEPUIS LE PROGRAMME
// ======================================================
function allerAuLieu(ordre) {

  // Réinitialiser l'affichage des trajets
  Object.values(trajetsCarte).forEach(function(trajet) {

    trajet.setStyle({
      opacity: 0.9
    });

    if (trajet.options.weightOriginal) {
      trajet.setStyle({
        weight: trajet.options.weightOriginal
      });
    }

  });
  
  reinitialiserHalosTrajets();

  trajetSelectionne = null;
  const marker = marqueursLieux[ordre];

  if (!marker) {
    console.warn("Lieu introuvable :", ordre);
    return;
  }
  // Sélectionner le nouveau marqueur
  selectionnerMarqueur(marker);

  map.flyTo(
    marker.getLatLng(),
    16, {
      duration: 1.2
    }
  );

  setTimeout(function() {
    marker.openPopup();
  }, 900);
}
// ======================================================
// TRAJETS ASSOCIES A UNE ETAPE
// ======================================================

function obtenirTrajetsAssocies(id) {

  const groupes = {

    // PLAN A — AREX Express
    "J01-T02": [
      "J01-T01",
      "J01-T02",
      "J01-T04"
    ],

    // PLAN B — AREX All-Stop
    "J01-T03": [
      "J01-T01",
      "J01-T03",
      "J01-T04"
    ]

  };

  return groupes[id] || [id];
}

function allerAuTrajet(id) {

  // ------------------------------------------
  // Retirer la sélection d'un éventuel lieu
  // ------------------------------------------

   deselectionnerMarqueurActif();

  // ------------------------------------------
  // Trouver les trajets associés
  // ------------------------------------------

  const idsAssocies =
    obtenirTrajetsAssocies(id);

  const trajetsAssocies =
    idsAssocies
    .map(function(idTrajet) {
      return trajetsCarte[idTrajet];
    })
    .filter(Boolean);

  if (trajetsAssocies.length === 0) {

    console.warn(
      "Trajet introuvable :",
      id
    );

    return;
  }
  // ------------------------------------------
  // Marqueur de destination
  // ------------------------------------------

  selectionnerDestinationTrajet(id);

  // ------------------------------------------
  // Réinitialiser tous les trajets
  // ------------------------------------------

  Object.values(trajetsCarte).forEach(
    function(trajet) {

      if (trajet.options.weightOriginal) {

        trajet.setStyle({
          weight: trajet.options.weightOriginal
        });

      }

      trajet.setStyle({
        opacity: 0.25
      });

    }
  );
  attenuerHalosTrajets();


  idsAssocies.forEach(
    function(idAssocie) {

      mettreEnAvantHalo(
        idAssocie,
        3
      );

    }
  );
  // ------------------------------------------
  // Mettre le groupe en évidence
  // ------------------------------------------

  trajetsAssocies.forEach(
    function(trajet) {

      if (!trajet.options.weightOriginal) {

        trajet.options.weightOriginal =
          trajet.options.weight;

      }

      trajet.setStyle({
        weight: trajet.options.weightOriginal + 3,

        opacity: 1
      });

      trajet.bringToFront();

    }
  );

  // ------------------------------------------
  // Trajet principal
  // ------------------------------------------

  const trajetPrincipal =
    trajetsCarte[id];

  trajetSelectionne =
    trajetPrincipal;

  if (trajetPrincipal) {

    mettreEnAvantHalo(
      id,
      5
    );

    trajetPrincipal.setStyle({
      weight: trajetPrincipal.options.weightOriginal + 5,

      opacity: 1
    });

    trajetPrincipal.bringToFront();

  }

  // ------------------------------------------
  // Calculer les limites du groupe
  // ------------------------------------------

  const limites =
    L.latLngBounds([]);

  trajetsAssocies.forEach(
    function(trajet) {

      limites.extend(
        trajet.getBounds()
      );

    }
  );

  // ------------------------------------------
  // Zoom sur l'ensemble du déplacement
  // ------------------------------------------

  if (limites.isValid()) {

    map.flyToBounds(
      limites, {
        padding: [50, 50],
        duration: 1.2
      }
    );

  }

  // ------------------------------------------
  // Popup du trajet principal
  // ------------------------------------------

  if (trajetPrincipal) {

    setTimeout(
      function() {

        trajetPrincipal.openPopup();

      },
      1200
    );

  }

}
// ======================================================
// BOUTON VOIR TOUTE LA JOURNEE
// ======================================================

const boutonJournee = L.control({
  position: "topleft"
});

boutonJournee.onAdd = function() {

  const div = L.DomUtil.create(
    "div",
    "bouton-journee"
  );

  div.innerHTML = "⌂ Toute la journée";
  div.title = "Afficher l'itinéraire complet";

  L.DomEvent.disableClickPropagation(div);

  div.onclick = function() {

    reinitialiserSelections();

    if (limitesJournee) {

      map.flyToBounds(
        limitesJournee, {
          padding: [30, 30],
          duration: 1
        }
      );

    }

  };

  return div;
};

boutonJournee.addTo(map);
// ======================================================
// LEGENDE
// ======================================================

// ======================================================
// LEGENDE DYNAMIQUE
// ======================================================

const configurationTransports = {

  Marche: {
    classe: "marche",
    icone: "🚶",
    label: "Marche"
  },

  Metro: {
    classe: "metro",
    icone: "🚇",
    label: "Métro"
  },

  Train: {
    classe: "train",
    icone: "🚆",
    label: "Train"
  },

  Bus: {
    classe: "bus",
    icone: "🚌",
    label: "Bus"
  },

  Tram: {
    classe: "tram",
    icone: "🚋",
    label: "Tram"
  },

  Ferry: {
    classe: "ferry",
    icone: "🚢",
    label: "Ferry"
  },

  Telepherique: {
    classe: "telepherique",
    icone: "🚡",
    label: "Téléphérique"
  }

};


// Charger les données du jour pour savoir
// quelles catégories sont réellement utilisées

Promise.all([

  fetch(`${dossierDonnees}/lieux.geojson`)
    .then(response => response.json()),

  fetch(`${dossierDonnees}/trajets.geojson`)
    .then(response => response.json())

])

.then(function([dataLieux, dataTrajets]) {


  // ------------------------------------------------------
  // TYPES DE TRANSPORT PRESENTS
  // ------------------------------------------------------

  const typesTransports = [

    ...new Set(

      dataTrajets.features

        .slice()

        .sort(function(a, b) {

          return (
            Number(a.properties.Ordre || 0) -
            Number(b.properties.Ordre || 0)
          );

        })

        .map(function(feature) {

          return feature.properties.Type;

        })

        .filter(Boolean)

    )

  ];


  // ------------------------------------------------------
  // TYPES DE LIEUX PRESENTS
  // ------------------------------------------------------

  const typesLieux = [

    ...new Set(

      dataLieux.features

        .slice()

        .sort(function(a, b) {

          return (
            Number(a.properties.Ordre || 0) -
            Number(b.properties.Ordre || 0)
          );

        })

        .map(function(feature) {

          return feature.properties.Type;

        })

        .filter(Boolean)

    )

  ];


  // ------------------------------------------------------
  // CONSTRUIRE LES TRANSPORTS
  // ------------------------------------------------------

  const lignesTransports = typesTransports

    .map(function(type) {

      const infos =
        configurationTransports[type] || {
          classe: type.toLowerCase(),
          icone: "📍",
          label: type
        };

      return `
        <div class="ligne-legende">

          <span class="trait ${infos.classe}"></span>

          ${infos.icone} ${infos.label}

        </div>
      `;

    })

    .join("");


  // ------------------------------------------------------
  // CONSTRUIRE LES LIEUX
  // ------------------------------------------------------

  const lignesLieux = typesLieux

    .map(function(type) {

      const infos =
        obtenirInfosLieu(type);

      return `
        <div class="ligne-legende">

          <span class="point-legende ${infos.classe}"></span>

          ${infos.icone} ${infos.label}

        </div>
      `;

    })

    .join("");


  // ------------------------------------------------------
  // CREER LA LEGENDE
  // ------------------------------------------------------

  const legende = L.control({
    position: "bottomright"
  });


  legende.onAdd = function(map) {

    const div = L.DomUtil.create(
      "div",
      "legende-carte"
    );


    div.innerHTML = `

      <div class="entete-legende">

        <div class="titre-legende">
          Légende
        </div>

        <button
          class="bouton-legende"
          type="button"
          aria-label="Afficher ou masquer la légende"
          aria-expanded="false">
          ▾
        </button>

      </div>


      <div class="contenu-legende">

        <div class="sous-titre-legende">
          Transports
        </div>

        ${lignesTransports}


        <div class="separateur-legende"></div>


        <div class="sous-titre-legende">
          Lieux
        </div>

        ${lignesLieux}

      </div>

    `;


    // Empêcher les clics dans la légende
    // d'agir sur la carte

    L.DomEvent.disableClickPropagation(div);
    L.DomEvent.disableScrollPropagation(div);


    const bouton =
      div.querySelector(".bouton-legende");

    const contenu =
      div.querySelector(".contenu-legende");


        // ------------------------------------------
    // ETAT DE LA LEGENDE
    // ------------------------------------------

    const mediaMobile =
      window.matchMedia(
        "(max-width: 900px)"
      );


    function definirEtatLegende(ouvert) {

      contenu.style.display =
        ouvert
          ? "block"
          : "none";

      bouton.textContent =
        ouvert
          ? "▴"
          : "▾";

      bouton.setAttribute(
        "aria-expanded",
        ouvert
          ? "true"
          : "false"
      );

      div.classList.toggle(
        "legende-ouverte",
        ouvert
      );

      div.classList.toggle(
        "legende-fermee",
        !ouvert
      );

    }


    // Ordinateur : ouverte
    // Tablette / téléphone : fermée

    definirEtatLegende(
      !mediaMobile.matches
    );


    // ------------------------------------------
    // OUVRIR / FERMER
    // ------------------------------------------

    bouton.addEventListener(
      "click",
      function() {

        const ouvert =
          bouton.getAttribute(
            "aria-expanded"
          ) === "true";

        definirEtatLegende(
          !ouvert
        );

      }
    );


    // Uniformiser aussi les emojis
    // créés dynamiquement dans la légende

    appliquerEmojiSVG(div);


    return div;

  };


  legende.addTo(map);

})

.catch(function(error) {

  console.error(
    "Erreur lors de la création de la légende :",
    error
  );

});