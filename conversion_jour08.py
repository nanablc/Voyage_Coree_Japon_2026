from pathlib import Path
import geopandas as gpd


# ============================================================
# DOSSIERS
# ============================================================

dossier_projet = Path(__file__).resolve().parent
dossier_jour = dossier_projet / "Data" / "jour08"


# ============================================================
# FICHIERS SOURCE
# ============================================================

fichier_lieux_coree = dossier_jour / "lieux_coree.shp"
fichier_trajets_coree = dossier_jour / "trajets_coree.shp"

fichier_lieux_japon = dossier_jour / "lieux_japon.shp"
fichier_trajets_japon = dossier_jour / "trajets_japon.shp"


# ============================================================
# FICHIERS DE SORTIE
# ============================================================

sortie_lieux_coree = dossier_jour / "lieux_coree.geojson"
sortie_trajets_coree = dossier_jour / "trajets_coree.geojson"

sortie_lieux_japon = dossier_jour / "lieux_japon.geojson"
sortie_trajets_japon = dossier_jour / "trajets_japon.geojson"


# ============================================================
# CHAMPS A CONSERVER
# ============================================================

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


# ============================================================
# FONCTION - VERIFICATION
# ============================================================

def verifier_fichier(fichier):
    if not fichier.exists():
        raise FileNotFoundError(
            f"Fichier introuvable : {fichier}"
        )


# ============================================================
# FONCTION - EXPORT DES LIEUX
# ============================================================

def exporter_lieux(fichier_source, fichier_sortie, territoire):

    verifier_fichier(fichier_source)

    lieux = gpd.read_file(fichier_source)

    print("\n==============================")
    print(f"LIEUX - {territoire}")
    print("==============================")

    print("Champs source :")
    print(list(lieux.columns))

    print("CRS source :", lieux.crs)


    colonnes_existantes = [
        champ
        for champ in colonnes_lieux
        if champ in lieux.columns
    ]


    lieux_web = lieux[
        colonnes_existantes + ["geometry"]
    ].copy()


    # Conversion en latitude / longitude pour Leaflet
    lieux_web = lieux_web.to_crs("EPSG:4326")


    # Export GeoJSON
    lieux_web.to_file(
        fichier_sortie,
        driver="GeoJSON"
    )


    print(f"\nLieux exportés : {len(lieux_web)}")

    if "Type" in lieux_web.columns:
        print("\nTypes de lieux :")
        print(lieux_web["Type"].value_counts())

    print(f"\nFichier créé : {fichier_sortie}")


# ============================================================
# FONCTION - EXPORT DES TRAJETS
# ============================================================

def exporter_trajets(fichier_source, fichier_sortie, territoire):

    verifier_fichier(fichier_source)

    trajets = gpd.read_file(fichier_source)

    print("\n==============================")
    print(f"TRAJETS - {territoire}")
    print("==============================")

    print("Champs source :")
    print(list(trajets.columns))

    print("CRS source :", trajets.crs)


    colonnes_existantes = [
        champ
        for champ in colonnes_trajets
        if champ in trajets.columns
    ]


    trajets_web = trajets[
        colonnes_existantes + ["geometry"]
    ].copy()


    # Conversion en latitude / longitude pour Leaflet
    trajets_web = trajets_web.to_crs("EPSG:4326")


    # Export GeoJSON
    trajets_web.to_file(
        fichier_sortie,
        driver="GeoJSON"
    )


    print(f"\nTrajets exportés : {len(trajets_web)}")

    if "Type" in trajets_web.columns:
        print("\nTypes de trajets :")
        print(trajets_web["Type"].value_counts())

    print(f"\nFichier créé : {fichier_sortie}")


# ============================================================
# EXPORT COREE
# ============================================================

exporter_lieux(
    fichier_lieux_coree,
    sortie_lieux_coree,
    "COREE"
)

exporter_trajets(
    fichier_trajets_coree,
    sortie_trajets_coree,
    "COREE"
)


# ============================================================
# EXPORT JAPON
# ============================================================

exporter_lieux(
    fichier_lieux_japon,
    sortie_lieux_japon,
    "JAPON"
)

exporter_trajets(
    fichier_trajets_japon,
    sortie_trajets_japon,
    "JAPON"
)


# ============================================================
# FIN
# ============================================================

print("\n==============================")
print("EXPORT JOUR 08 TERMINE")
print("==============================")

print("\nCOREE")
print(f"Lieux   : {sortie_lieux_coree}")
print(f"Trajets : {sortie_trajets_coree}")

print("\nJAPON")
print(f"Lieux   : {sortie_lieux_japon}")
print(f"Trajets : {sortie_trajets_japon}")