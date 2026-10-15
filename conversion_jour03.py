import geopandas as gpd
import os


# ==========================================================
# CONFIGURATION
# ==========================================================

dossier = r"C:\Users\xeosprod\Downloads\Voyage_Coree_Japon_2026\Data\jour03"

lieux_shp = os.path.join(
    dossier,
    "lieux.shp"
)

trajets_shp = os.path.join(
    dossier,
    "trajets.shp"
)

lieux_geojson = os.path.join(
    dossier,
    "lieux.geojson"
)

trajets_geojson = os.path.join(
    dossier,
    "trajets.geojson"
)


# ==========================================================
# LIEUX
# ==========================================================

print("======================================")
print("LECTURE DES LIEUX")
print("======================================")

lieux = gpd.read_file(
    lieux_shp
)

print("\nChamps disponibles :")
print(lieux.columns)

print("\nSystème de coordonnées :")
print(lieux.crs)


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
    colonnes_lieux_existantes +
    ["geometry"]
].copy()


lieux_web = lieux_web.to_crs(
    "EPSG:4326"
)


lieux_web.to_file(
    lieux_geojson,
    driver="GeoJSON"
)


print("\nGeoJSON des lieux créé :")
print(lieux_geojson)


# ==========================================================
# TRAJETS
# ==========================================================

print("\n======================================")
print("LECTURE DES TRAJETS")
print("======================================")

trajets = gpd.read_file(
    trajets_shp
)

print("\nChamps disponibles :")
print(trajets.columns)

print("\nSystème de coordonnées :")
print(trajets.crs)


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
    colonnes_trajets_existantes +
    ["geometry"]
].copy()


trajets_web = trajets_web.to_crs(
    "EPSG:4326"
)


trajets_web.to_file(
    trajets_geojson,
    driver="GeoJSON"
)


print("\nGeoJSON des trajets créé :")
print(trajets_geojson)


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