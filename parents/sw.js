const CACHE_NAME =
  "voyage-coree-japon-v2";


// ======================================================
// PAGES
// ======================================================

const pages = [
  "./",
  "./index.html",
  ...Array.from(
    { length: 21 },
    (_, index) =>
      `./jour${String(index + 2).padStart(2, "0")}.html`
  )
];


// ======================================================
// DONNEES GEOJSON
// ======================================================

const jours =
  Array.from(
    { length: 22 },
    (_, index) =>
      String(index + 1).padStart(2, "0")
  );


const donnees =
  jours.flatMap(function(jour) {

    return [
      `./Data/jour${jour}/lieux.geojson`,
      `./Data/jour${jour}/trajets.geojson`
    ];

  });


// ======================================================
// FICHIERS PRINCIPAUX
// ======================================================

const fichiers = [

  "./manifest.webmanifest",

  "./css/style.css",

  "./js/app.js",

  "./js/app_jour08.js",

  ...pages,

  ...donnees

];


// ======================================================
// INSTALLATION
// ======================================================

// ======================================================
// INSTALLATION
// ======================================================

self.addEventListener(
  "install",
  function(event) {

    event.waitUntil(

      (async function() {

        const cache =
          await caches.open(
            CACHE_NAME
          );

        console.log(
          "Téléchargement du voyage pour utilisation hors ligne..."
        );

        await cache.addAll(
          fichiers
        );

        console.log(
          "Toutes les journées sont disponibles hors ligne."
        );

        await self.skipWaiting();

      })()

    );

  }
);


// ======================================================
// ACTIVATION
// ======================================================

self.addEventListener(
  "activate",
  function(event) {

    event.waitUntil(

      (async function() {

        const cachesExistants =
          await caches.keys();


        await Promise.all(

          cachesExistants
            .filter(function(nom) {

              return (
                nom.startsWith(
                  "voyage-coree-japon-"
                ) &&
                nom !== CACHE_NAME
              );

            })
            .map(function(nom) {

              return caches.delete(nom);

            })

        );


        await self.clients.claim();

      })()

    );

  }
);


// ======================================================
// FONCTION DE MISE EN CACHE
// ======================================================

async function cacheAvecReseau(
  request
) {

  const cache =
    await caches.open(
      CACHE_NAME
    );


  const resultatCache =
    await cache.match(
      request
    );


  if (resultatCache) {
    return resultatCache;
  }


  try {

    const response =
      await fetch(request);


    if (
      response.ok ||
      response.type === "opaque"
    ) {

      await cache.put(
        request,
        response.clone()
      );

    }


    return response;

  } catch (error) {

    return Response.error();

  }

}


// ======================================================
// REQUETES
// ======================================================

self.addEventListener(
  "fetch",
  function(event) {

    const request =
      event.request;


    if (request.method !== "GET") {
      return;
    }


    const url =
      new URL(request.url);


    // ------------------------------------------
    // NAVIGATION ENTRE LES JOURNEES
    // ------------------------------------------

    if (request.mode === "navigate") {

      event.respondWith(

        (async function() {

          try {

            const response =
              await fetch(request);


            if (response.ok) {

              const cache =
                await caches.open(
                  CACHE_NAME
                );

              await cache.put(
                request,
                response.clone()
              );

            }


            return response;

          } catch (error) {

            return (
              await caches.match(
                request
              )
            ) || (
              await caches.match(
                "./index.html"
              )
            );

          }

        })()

      );

      return;
    }


    // ------------------------------------------
    // FICHIERS DU SITE
    // ------------------------------------------

    if (
      url.origin ===
      self.location.origin
    ) {

      event.respondWith(
        cacheAvecReseau(
          request
        )
      );

      return;
    }


    // ------------------------------------------
    // FOND DE CARTE STADIA
    // ------------------------------------------

    if (
      url.hostname.includes(
        "stadiamaps.com"
      )
    ) {

      event.respondWith(
        cacheAvecReseau(
          request
        )
      );

      return;
    }


    // ------------------------------------------
    // CDN EXTERNES
    // Leaflet / Twemoji / etc.
    // ------------------------------------------

    if (
      url.hostname ===
        "cdn.jsdelivr.net" ||
      url.hostname.includes(
        "unpkg.com"
      )
    ) {

      event.respondWith(
        cacheAvecReseau(
          request
        )
      );

    }

  }
);