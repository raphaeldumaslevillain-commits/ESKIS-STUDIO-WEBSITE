# ESKIS — When creativity connect us.

Portfolio statique en HTML, CSS et JavaScript : 16 pages, 8 projets issus des fichiers fournis. Ressources et bibliothèques hébergées localement.

## Expérience
Ouverture Horizon, typographie animée, galerie des projets et formulaire limité à 1 000 caractères. Quatre catégories : Illustrations, Identité visuelle, Packaging et Print. Le cinquième dossier lumineux ouvre une fenêtre de possibilités graphiques. Tarif : 40 €/h. Le vocabulaire présente ESKIS comme une agence. Menu plein écran, thème noir ou crème et typographie sans serif.

## Projets et visuels
`projects.json` contient les titres, catégories, galeries et configuration des packagings. Aucune description de projet n’est ajoutée. Les images sélectionnées sont converties en JPEG optimisés, avec des couvertures de 800 et 1 600 px de large pour les listes. Les fichiers de travail AI, PSD et InDesign ainsi que les PDF lourds ne sont pas copiés dans le site. Les originaux sont conservés dans les dossiers de l’utilisateur.

## Packaging
`src/packaging-viewer.js` construit la boîte à partir de ses faces. Le module compilé `assets/packaging-viewer.js` est chargé uniquement sur les pages qui possèdent une vue 3D. Rotation à la souris ou au toucher, zoom, commandes clavier, réinitialisation et plein écran. Rendu à la demande, textures limitées, arrêt hors écran et image de repli. Les surfaces sans visuel source restent sans impression.

## Modifier et publier
Servir ce dossier avec un serveur HTTP statique. Pour GitHub Pages : branche `main`, dossier `/`. Le site compilé fonctionne sans installation ni CDN. Pour reconstruire les modules : `npm install`, puis `npm run build:horizon`, `npm run build:buttons` ou `npm run build:packaging`. Les versions des bibliothèques sont fixées dans `package.json`. Les pages, styles et scripts restent directement éditables.

## Contact
Le formulaire prépare un brief téléchargeable ; il n’envoie aucun message. Les coordonnées réelles et un service d’envoi restent à connecter avant la mise en service commerciale. La page « Un projet ? » ne présente pas de prix. Les prestations sont conservées dans le brief et le texte est limité à 1 000 caractères avec un compteur visible.

## Sources et crédits
Références 21st.dev, licences et provenance des composants dans `21ST-CREDITS.md`. Tracés du logo ESKIS fournis par leur propriétaire. DM Sans hébergée localement. Le parcours BNP Paribas, SNCF, Gare Remarquable et les plus de 100 clients a été communiqué par le propriétaire du site. Le thème est la seule préférence stockée ; aucun outil de suivi ajouté.

## Ajustements V12
Deux projets cliquables par dossier sur l’accueil et les services. Illustrations sans marges ajoutées et titre au survol de la galerie. Pelote : sept slides du PDF, dans l’ordre et bord à bord. Les deux vues 3D ont un fond transparent. Format MOKI corrigé : 20 × 7 × 5 cm ; couvercle, base et grands côtés sont réaffectés selon les proportions des visuels. Yves Rocher : profondeur augmentée, petits côtés inversés, visuels à plat du recto/verso retirés de la galerie.
