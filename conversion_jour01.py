import geopandas as gpd


# ======================================================
# CHEMINS
# ======================================================

dossier = r"C:\Users\xeosprod\Downloads\Voyage_Coree_Japon_2026\Data\jour01"

lieux_shp = dossier + r"\lieux.shp"
trajets_shp = dossier + r"\trajets.shp"

lieux_geojson = dossier + r"\lieux.geojson"
trajets_geojson = dossier + r"\trajets.geojson"


# ======================================================
# LIEUX
# ======================================================

print("======================================")
print("LECTURE DES LIEUX")
print("======================================")

lieux = gpd.read_file(lieux_shp)

print("")
print("Champs disponibles :")
print(lieux.columns)

print("")
print("Système de coordonnées :")
print(lieux.crs)


# ------------------------------------------------------
# Garder seulement les champs utiles
# ------------------------------------------------------

colonnes_lieux = [
    "ID",
    "Ordre",
    "Nom",
    "Type",
    "SousType",
    "Ref",
    "Note",
    "Affichage",
    "Adresse",
    "ELEVATION"
]

colonnes_lieux_existantes = [
    champ
    for champ in colonnes_lieux
    if champ in lieux.columns
]

lieux_web = lieux[
    colonnes_lieux_existantes + ["geometry"]
].copy()
# ------------------------------------------------------
# Conversion en WGS84 pour Leaflet
# ------------------------------------------------------

lieux_web = lieux_web.to_crs("EPSG:4326")


# ------------------------------------------------------
# Export GeoJSON
# ------------------------------------------------------

lieux_web.to_file(
    lieux_geojson,
    driver="GeoJSON"
)

print("")
print("✓ lieux.geojson créé")


# ======================================================
# TRAJETS
# ======================================================

print("")
print("======================================")
print("LECTURE DES TRAJETS")
print("======================================")

trajets = gpd.read_file(trajets_shp)

print("")
print("Champs disponibles :")
print(trajets.columns)

print("")
print("Système de coordonnées :")
print(trajets.crs)


# ------------------------------------------------------
# Garder seulement les champs utiles
# ------------------------------------------------------

colonnes_trajets = [
    "ID",
    "Ordre",
    "Nom",
    "Type",
    "SousType",
    "Origine",
    "Destin",
    "Ligne",
    "Direction",
    "DureeMin",
    "Groupe",
    "Option",
    "Priorite",
    "Role",
    "Note"
]

colonnes_trajets_existantes = [
    champ
    for champ in colonnes_trajets
    if champ in trajets.columns
]

trajets_web = trajets[
    colonnes_trajets_existantes + ["geometry"]
].copy()


# ------------------------------------------------------
# Conversion en WGS84 pour Leaflet
# ------------------------------------------------------

trajets_web = trajets_web.to_crs("EPSG:4326")


# ------------------------------------------------------
# Export GeoJSON
# ------------------------------------------------------

trajets_web.to_file(
    trajets_geojson,
    driver="GeoJSON"
)

print("")
print("✓ trajets.geojson créé")


# ======================================================
# VERIFICATION RAPIDE
# ======================================================

print("")
print("======================================")
print("VERIFICATION")
print("======================================")

print("")
print("Lieux exportés :", len(lieux_web))
print("Trajets exportés :", len(trajets_web))

print("")
print("Types de lieux :")
print(lieux_web["Type"].value_counts(dropna=False))

print("")
print("Types de trajets :")
print(trajets_web["Type"].value_counts(dropna=False))


# ======================================================
# FIN
# ======================================================

print("")
print("======================================")
print("CONVERSION TERMINEE")
print("======================================")

print("")
print("Fichiers créés :")
print(lieux_geojson)
print(trajets_geojson)