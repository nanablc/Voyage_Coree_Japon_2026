from pathlib import Path
import geopandas as gpd


# ============================================================
# DOSSIERS
# ============================================================

dossier_projet = Path(__file__).resolve().parent
dossier_jour = dossier_projet / "Data" / "jour10"

fichier_lieux = dossier_jour / "lieux.shp"
fichier_trajets = dossier_jour / "trajets.shp"

sortie_lieux = dossier_jour / "lieux.geojson"
sortie_trajets = dossier_jour / "trajets.geojson"


# ============================================================
# VERIFICATIONS
# ============================================================

if not fichier_lieux.exists():
    raise FileNotFoundError(
        f"Fichier introuvable : {fichier_lieux}"
    )

if not fichier_trajets.exists():
    raise FileNotFoundError(
        f"Fichier introuvable : {fichier_trajets}"
    )


# ============================================================
# LIEUX
# ============================================================

lieux = gpd.read_file(fichier_lieux)

print("\n==============================")
print("LIEUX")
print("==============================")

print("Champs source :")
print(list(lieux.columns))

print("CRS source :", lieux.crs)


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


# Conversion en latitude / longitude pour Leaflet
lieux_web = lieux_web.to_crs("EPSG:4326")


# Export GeoJSON
lieux_web.to_file(
    sortie_lieux,
    driver="GeoJSON"
)


print(f"\nLieux exportés : {len(lieux_web)}")

if "Type" in lieux_web.columns:
    print("\nTypes de lieux :")
    print(lieux_web["Type"].value_counts())


# ============================================================
# TRAJETS
# ============================================================

trajets = gpd.read_file(fichier_trajets)

print("\n==============================")
print("TRAJETS")
print("==============================")

print("Champs source :")
print(list(trajets.columns))

print("CRS source :", trajets.crs)


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


# Conversion en latitude / longitude pour Leaflet
trajets_web = trajets_web.to_crs("EPSG:4326")


# Export GeoJSON
trajets_web.to_file(
    sortie_trajets,
    driver="GeoJSON"
)


print(f"\nTrajets exportés : {len(trajets_web)}")

if "Type" in trajets_web.columns:
    print("\nTypes de trajets :")
    print(trajets_web["Type"].value_counts())


# ============================================================
# FIN
# ============================================================

print("\n==============================")
print("EXPORT JOUR 10 TERMINE")
print("==============================")

print(f"Lieux   : {sortie_lieux}")
print(f"Trajets : {sortie_trajets}")