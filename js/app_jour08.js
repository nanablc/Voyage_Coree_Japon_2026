// ======================================================
// CONFIGURATION JOUR 08
// ======================================================

const jour = document.body.dataset.jour;

if (!jour) {
  console.error(
    "Aucun jour défini dans l'attribut data-jour du <body>."
  );
}

const dossierDonnees = `Data/${jour}`;


// ======================================================
// CONFIGURATION DES DEUX CARTES
// ======================================================

const configurationCartes = {

  coree: {
    element: "map-coree",
    lieux: "lieux_coree.geojson",
    trajets: "trajets_coree.geojson",
    centre: [35.18, 129.08],
    zoom: 11
  },

  japon: {
    element: "map-japon",
    lieux: "lieux_japon.geojson",
    trajets: "trajets_japon.geojson",
    centre: [34.69, 135.50],
    zoom: 10
  }

};


// ======================================================
// STOCKAGE DES CARTES
// ======================================================

const cartes = {};


// ======================================================
// INFORMATIONS DES TYPES DE LIEUX
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
// TRANSPORTS
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

  return "📍";
}


function obtenirStyleTrajet(type) {

  if (type === "Marche") {

    return {
      color: "#7C3AED",
      weight: 5,
      opacity: 0.9,
      dashArray: "4, 7"
    };

  }


  if (type === "Metro") {

    return {
      color: "#16A34A",
      weight: 5,
      opacity: 0.9
    };

  }


  if (type === "Train") {

    return {
      color: "#2563EB",
      weight: 6,
      opacity: 0.9
    };

  }


  if (type === "Bus") {

    return {
      color: "#F59E0B",
      weight: 5,
      opacity: 0.9,
      dashArray: "10, 5"
    };

  }


  if (type === "Telepherique") {

    return {
      color: "#0891B2",
      weight: 5,
      opacity: 0.9
    };

  }


  return {
    color: "#555555",
    weight: 4,
    opacity: 0.9
  };

}


// ======================================================
// CHARGEMENT JSON
// ======================================================

function chargerGeoJSON(fichier) {

  return fetch(`${dossierDonnees}/${fichier}`)

    .then(function(response) {

      if (!response.ok) {

        throw new Error(
          `${response.status} - ${response.statusText}`
        );

      }

      return response.json();

    });

}


// ======================================================
// CREATION D'UNE CARTE
// ======================================================

async function initialiserCarte(nomCarte, config) {

  const map = L.map(
    config.element
  ).setView(
    config.centre,
    config.zoom
  );


  // ------------------------------------------------------
  // FOND DE CARTE
  // ------------------------------------------------------

  L.tileLayer(
    "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
    {
      maxZoom: 20,

      attribution:
        '&copy; Stadia Maps ' +
        '&copy; OpenMapTiles ' +
        '&copy; OpenStreetMap contributors'
    }
  ).addTo(map);


  // ------------------------------------------------------
  // CONTEXTE
  // ------------------------------------------------------

  const contexte = {

    nom: nomCarte,

    map: map,

    marqueursLieux: {},

    trajetsCarte: {},

    infosTrajets: {},

    marqueurSelectionne: null,

    trajetSelectionne: null,

    limitesJournee: null

  };


  cartes[nomCarte] = contexte;


  // ------------------------------------------------------
  // CHARGEMENT DES DONNEES
  // ------------------------------------------------------

  try {

    const [
      dataLieux,
      dataTrajets
    ] = await Promise.all([

      chargerGeoJSON(config.lieux),

      chargerGeoJSON(config.trajets)

    ]);


    afficherLieux(
      contexte,
      dataLieux
    );


    afficherTrajets(
      contexte,
      dataTrajets
    );


    ajouterBoutonVueGenerale(
      contexte
    );


    ajouterLegende(
      contexte,
      dataLieux,
      dataTrajets
    );

  }

  catch (error) {

    console.error(
      `Erreur lors du chargement de la carte ${nomCarte} :`,
      error
    );

  }

}


// ======================================================
// AFFICHAGE DES LIEUX
// ======================================================

function afficherLieux(contexte, data) {

  const nombreParCoordonnee = {};
  const indexParCoordonnee = {};


  // ------------------------------------------------------
  // REPERER LES POINTS SUPERPOSES
  // ------------------------------------------------------

  data.features.forEach(function(feature) {

    if (
      !feature.geometry ||
      feature.geometry.type !== "Point"
    ) {
      return;
    }


    const coords =
      feature.geometry.coordinates;


    const cle =
      coords[0].toFixed(6) +
      "," +
      coords[1].toFixed(6);


    nombreParCoordonnee[cle] =
      (nombreParCoordonnee[cle] || 0) + 1;

  });


  // ------------------------------------------------------
  // CREER LES LIEUX
  // ------------------------------------------------------

  const coucheLieux = L.geoJSON(
    data,
    {

      pointToLayer: function(feature, latlng) {

        const ordre =
          feature.properties.Ordre;


        const categorie =
          feature.properties.Type || "Lieu";


        const classeCategorie =
          "lieu-" +
          categorie.toLowerCase();


        const cle =
          latlng.lng.toFixed(6) +
          "," +
          latlng.lat.toFixed(6);


        const total =
          nombreParCoordonnee[cle] || 1;


        const index =
          indexParCoordonnee[cle] || 0;


        indexParCoordonnee[cle] =
          index + 1;


        const decalages = [
          [0, 0],
          [17, 0],
          [-17, 0],
          [0, 17],
          [0, -17]
        ];


        const decalage =
          total > 1
            ? decalages[
                index % decalages.length
              ]
            : [0, 0];


        const icone = L.divIcon({

          className:
            "numero-lieu " +
            classeCategorie,

          html:
            "<div>" +
            ordre +
            "</div>",

          iconSize: [32, 32],

          iconAnchor: [
            16 - decalage[0],
            16 - decalage[1]
          ]

        });


        const marker = L.marker(
          latlng,
          {
            icon: icone
          }
        );


        contexte.marqueursLieux[
          ordre
        ] = marker;


        marker.on(
          "click",
          function() {

            selectionnerLieuDepuisCarte(
              contexte.nom,
              ordre,
              marker
            );

          }
        );


        return marker;

      },


      onEachFeature: function(
        feature,
        layer
      ) {

        const p =
          feature.properties;


        const nom =
          p.Nom;


        const ordre =
          p.Ordre;


        const type =
          p.Type || "Lieu";


        const sousType =
          p.SousType;


        const ref =
          p.Ref;


        const note =
          p.Note;


        const adresse =
          p.Adresse;


        const elevation =
          p.ELEVATION;


        const infosLieu =
          obtenirInfosLieu(type);


        let detailsLieu = "";


        if (ref) {

          detailsLieu += `
            <span class="popup-badge">
              ${
                type === "Metro"
                  ? "🚇"
                  : "🔖"
              }
              ${ref}
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

              <div
                class="popup-transport-icone
                popup-lieu-icone
                ${infosLieu.classe}">
                ${infosLieu.icone}
              </div>

              <div class="popup-transport-contenu">

                <div
                  class="popup-etiquette
                  popup-etiquette-lieu
                  ${infosLieu.classe}">
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

    }
  ).addTo(
    contexte.map
  );


  // ------------------------------------------------------
  // ZOOM INITIAL
  // ------------------------------------------------------

  contexte.limitesJournee =
    coucheLieux.getBounds();


  if (
    contexte.limitesJournee.isValid()
  ) {

    contexte.map.fitBounds(
      contexte.limitesJournee,
      {
        padding: [25, 25]
      }
    );

  }

}


// ======================================================
// AFFICHAGE DES TRAJETS
// ======================================================

function afficherTrajets(
  contexte,
  data
) {

  L.geoJSON(
    data,
    {

      style: function(feature) {

        return obtenirStyleTrajet(
          feature.properties.Type
        );

      },


      onEachFeature: function(
        feature,
        layer
      ) {

        const p =
          feature.properties;


        const id =
          p.ID;


        const nom =
          p.Nom ||
          id ||
          "Trajet";


        const type =
          p.Type ||
          "Trajet";


        const origine =
          p.Origine;


        const destination =
          p.Destin;


        const ligne =
          p.Ligne;


        const direction =
          p.Direction;


        const duree =
          p.DureeMin;


        const option =
          p.Option;


        const priorite =
          p.Priorite;


        const iconeTransport =
          obtenirIconeTransport(type);


        // ------------------------------------------
        // STOCKAGE DU TRAJET
        // ------------------------------------------

        if (id) {

          contexte.trajetsCarte[
            id
          ] = layer;


          contexte.infosTrajets[
            id
          ] = {

            groupe:
              p.Groupe || "",

            option:
              p.Option || ""

          };


          layer.options.weightOriginal =
            layer.options.weight;


          layer.on(
            "click",
            function() {

              selectionnerTrajetDepuisCarte(
                contexte.nom,
                id,
                layer
              );

            }
          );

        }


        // ------------------------------------------
        // POPUP
        // ------------------------------------------

        let contenuDetails = "";


        if (
          origine &&
          destination
        ) {

          contenuDetails += `
            <div class="popup-trajet-parcours">
              ${origine} → ${destination}
            </div>
          `;

        }


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

    }
  ).addTo(
    contexte.map
  );

}


// ======================================================
// SELECTION DU PROGRAMME
// ======================================================

function selectionnerEtape(element) {

  document
    .querySelectorAll(
      ".etape-selectionnee"
    )
    .forEach(
      function(etape) {

        etape.classList.remove(
          "etape-selectionnee"
        );

      }
    );


  if (element) {

    element.classList.add(
      "etape-selectionnee"
    );

  }

}


// ======================================================
// REINITIALISATION
// ======================================================

function reinitialiserContexte(
  contexte
) {

  if (
    contexte.marqueurSelectionne
  ) {

    contexte
      .marqueurSelectionne
      .getElement()
      ?.classList.remove(
        "selectionne"
      );


    contexte.marqueurSelectionne =
      null;

  }


  Object
    .values(
      contexte.trajetsCarte
    )
    .forEach(
      function(trajet) {

        trajet.setStyle({
          opacity: 0.9,
          weight:
            trajet.options
              .weightOriginal
        });

      }
    );


  contexte.trajetSelectionne =
    null;

}


function reinitialiserSelections() {

  document
    .querySelectorAll(
      ".etape-selectionnee"
    )
    .forEach(
      function(etape) {

        etape.classList.remove(
          "etape-selectionnee"
        );

      }
    );


  Object
    .values(cartes)
    .forEach(
      reinitialiserContexte
    );

}


// ======================================================
// LIEU CLIQUE DEPUIS LA CARTE
// ======================================================

function selectionnerLieuDepuisCarte(
  nomCarte,
  ordre,
  marker
) {

  reinitialiserSelections();


  const contexte =
    cartes[nomCarte];


  contexte.marqueurSelectionne =
    marker;


  marker
    .getElement()
    ?.classList.add(
      "selectionne"
    );

   const etapeProgramme =
    document.querySelector(
      `[data-carte="${nomCarte}"][data-lieu="${ordre}"]`
    ) ||
    document.querySelector(
      `[data-carte="${nomCarte}"][data-lieux~="${ordre}"]`
    );

  if (!etapeProgramme) {
    return;
  }


  selectionnerEtape(
    etapeProgramme
  );


  etapeProgramme.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

}


// ======================================================
// TRAJETS ASSOCIES
// ======================================================

function obtenirTrajetsAssocies(
  contexte,
  id
) {

  const informations =
    contexte.infosTrajets[id];


  if (
    !informations ||
    !informations.groupe
  ) {

    return [id];

  }


  return Object
    .entries(
      contexte.infosTrajets
    )
    .filter(
      function([
        autreId,
        autresInformations
      ]) {

        if (
          autresInformations.groupe !==
          informations.groupe
        ) {

          return false;

        }


        if (
          informations.option
        ) {

          return (
            autresInformations.option ===
            informations.option
          );

        }


        return true;

      }
    )
    .map(
      function([autreId]) {

        return autreId;

      }
    );

}


// ======================================================
// METTRE UN TRAJET / GROUPE EN EVIDENCE
// ======================================================

function mettreTrajetsEnEvidence(
  contexte,
  id
) {

  const idsAssocies =
    obtenirTrajetsAssocies(
      contexte,
      id
    );


  const trajetsAssocies =
    idsAssocies
      .map(
        function(idTrajet) {

          return contexte
            .trajetsCarte[
              idTrajet
            ];

        }
      )
      .filter(Boolean);


  if (
    trajetsAssocies.length === 0
  ) {

    return [];

  }


  Object
    .values(
      contexte.trajetsCarte
    )
    .forEach(
      function(trajet) {

        trajet.setStyle({

          weight:
            trajet.options
              .weightOriginal,

          opacity: 0.25

        });

      }
    );


  trajetsAssocies.forEach(
    function(trajet) {

      trajet.setStyle({

        weight:
          trajet.options
            .weightOriginal + 3,

        opacity: 1

      });


      trajet.bringToFront();

    }
  );


  const trajetPrincipal =
    contexte.trajetsCarte[id];


  if (trajetPrincipal) {

    contexte.trajetSelectionne =
      trajetPrincipal;


    trajetPrincipal.setStyle({

      weight:
        trajetPrincipal.options
          .weightOriginal + 5,

      opacity: 1

    });


    trajetPrincipal.bringToFront();

  }


  return trajetsAssocies;

}


// ======================================================
// TRAJET CLIQUE DEPUIS LA CARTE
// ======================================================

function selectionnerTrajetDepuisCarte(
  nomCarte,
  id,
  trajet
) {

  reinitialiserSelections();


  const contexte =
    cartes[nomCarte];


  mettreTrajetsEnEvidence(
    contexte,
    id
  );

  const etapeProgramme =
    document.querySelector(
      `[data-trajet="${id}"]`
    ) ||
    document.querySelector(
      `[data-trajets~="${id}"]`
    );

  if (!etapeProgramme) {
    return;
  }


  selectionnerEtape(
    etapeProgramme
  );


  etapeProgramme.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

}


// ======================================================
// ALLER A UN LIEU DEPUIS LE PROGRAMME
// ======================================================

function allerAuLieu(
  nomCarte,
  ordre
) {

  if (
    ordre === undefined
  ) {

    console.warn(
      "Jour 08 : préciser la carte ('coree' ou 'japon') dans allerAuLieu()."
    );

    return;

  }


  reinitialiserSelections();


  const contexte =
    cartes[nomCarte];


  if (!contexte) {

    console.warn(
      "Carte introuvable :",
      nomCarte
    );

    return;

  }


  const marker =
    contexte
      .marqueursLieux[
        ordre
      ];


  if (!marker) {

    console.warn(
      "Lieu introuvable :",
      nomCarte,
      ordre
    );

    return;

  }


  contexte.marqueurSelectionne =
    marker;


  marker
    .getElement()
    ?.classList.add(
      "selectionne"
    );


  contexte.map.flyTo(
    marker.getLatLng(),
    16,
    {
      duration: 1.2
    }
  );


  setTimeout(
    function() {

      marker.openPopup();

    },
    900
  );

}


// ======================================================
// ALLER A UN TRAJET DEPUIS LE PROGRAMME
// ======================================================

function allerAuTrajet(
  nomCarte,
  id
) {

  if (
    id === undefined
  ) {

    console.warn(
      "Jour 08 : préciser la carte ('coree' ou 'japon') dans allerAuTrajet()."
    );

    return;

  }


  reinitialiserSelections();


  const contexte =
    cartes[nomCarte];


  if (!contexte) {

    console.warn(
      "Carte introuvable :",
      nomCarte
    );

    return;

  }


  const trajetsAssocies =
    mettreTrajetsEnEvidence(
      contexte,
      id
    );


  if (
    trajetsAssocies.length === 0
  ) {

    console.warn(
      "Trajet introuvable :",
      id
    );

    return;

  }


  const limites =
    L.latLngBounds([]);


  trajetsAssocies.forEach(
    function(trajet) {

      limites.extend(
        trajet.getBounds()
      );

    }
  );


  if (limites.isValid()) {

    contexte.map.flyToBounds(
      limites,
      {
        padding: [35, 35],
        duration: 1.2
      }
    );

  }


  const trajetPrincipal =
    contexte
      .trajetsCarte[id];


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
// BOUTON VOIR TOUT
// ======================================================

function ajouterBoutonVueGenerale(
  contexte
) {

  const bouton =
    L.control({
      position: "topleft"
    });


  bouton.onAdd =
    function() {

      const div =
        L.DomUtil.create(
          "div",
          "bouton-journee"
        );


      div.innerHTML =
        "⌂ Tout voir";


      div.title =
        "Afficher toute cette partie de la journée";


      L.DomEvent
        .disableClickPropagation(
          div
        );


      div.onclick =
        function() {

          reinitialiserSelections();


          if (
            contexte
              .limitesJournee &&
            contexte
              .limitesJournee
              .isValid()
          ) {

            contexte.map.flyToBounds(
              contexte.limitesJournee,
              {
                padding: [25, 25],
                duration: 1
              }
            );

          }

        };


      return div;

    };


  bouton.addTo(
    contexte.map
  );

}


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

  Telepherique: {
    classe: "telepherique",
    icone: "🚡",
    label: "Téléphérique"
  }

};


function ajouterLegende(
  contexte,
  dataLieux,
  dataTrajets
) {

  const typesTransports = [

    ...new Set(

      dataTrajets.features

        .slice()

        .sort(
          function(a, b) {

            return (
              Number(
                a.properties.Ordre || 0
              ) -
              Number(
                b.properties.Ordre || 0
              )
            );

          }
        )

        .map(
          function(feature) {

            return feature
              .properties
              .Type;

          }
        )

        .filter(Boolean)

    )

  ];


  const typesLieux = [

    ...new Set(

      dataLieux.features

        .slice()

        .sort(
          function(a, b) {

            return (
              Number(
                a.properties.Ordre || 0
              ) -
              Number(
                b.properties.Ordre || 0
              )
            );

          }
        )

        .map(
          function(feature) {

            return feature
              .properties
              .Type;

          }
        )

        .filter(Boolean)

    )

  ];


  const lignesTransports =
    typesTransports

      .map(
        function(type) {

          const infos =
            configurationTransports[
              type
            ] || {

              classe:
                type.toLowerCase(),

              icone: "📍",

              label: type

            };


          return `
            <div class="ligne-legende">
              <span
                class="trait ${infos.classe}">
              </span>
              ${infos.icone}
              ${infos.label}
            </div>
          `;

        }
      )

      .join("");


  const lignesLieux =
    typesLieux

      .map(
        function(type) {

          const infos =
            obtenirInfosLieu(
              type
            );


          return `
            <div class="ligne-legende">
              <span
                class="point-legende ${infos.classe}">
              </span>
              ${infos.icone}
              ${infos.label}
            </div>
          `;

        }
      )

      .join("");


  const legende =
    L.control({
      position: "bottomright"
    });


  legende.onAdd =
    function() {

      const div =
        L.DomUtil.create(
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


        <div
          class="contenu-legende"
          style="display:none">

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


      L.DomEvent
        .disableClickPropagation(
          div
        );


      L.DomEvent
        .disableScrollPropagation(
          div
        );


      const bouton =
        div.querySelector(
          ".bouton-legende"
        );


      const contenu =
        div.querySelector(
          ".contenu-legende"
        );


      bouton.style.display =
        "inline-flex";


      bouton.addEventListener(
        "click",
        function() {

          const ouvert =
            contenu.style.display !==
            "none";


          contenu.style.display =
            ouvert
              ? "none"
              : "block";


          bouton.textContent =
            ouvert
              ? "▾"
              : "▴";


          bouton.setAttribute(
            "aria-expanded",
            ouvert
              ? "false"
              : "true"
          );

        }
      );


      return div;

    };


  legende.addTo(
    contexte.map
  );

}


// ======================================================
// INITIALISATION
// ======================================================

initialiserCarte(
  "coree",
  configurationCartes.coree
);


initialiserCarte(
  "japon",
  configurationCartes.japon
);