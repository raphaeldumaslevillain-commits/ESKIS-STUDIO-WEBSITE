# ESKIS — When creativity connect us.

Portfolio statique en HTML, CSS et JavaScript. 20 pages dont 12 projets fictifs. Ressources, polices et bibliothèques hébergées localement.

## Expérience
Ouverture Horizon en 3D avec paysage monochrome, caméra au défilement et particules. Titre à mots animés, six dossiers de services givrés avec inclinaison au pointeur et fiches en éventail, tarif à 40 €/h, galerie incurvée des douze projets suivie directement du formulaire. Page « Déroulement du projet » accessible dans le menu et depuis les services : cinq étapes en orbite, détails au clic et recentrage, sans commande de pause visible. La fenêtre orbitale d’accueil reste disponible. Boutons d’action principaux en métal liquide, adaptés du composant fourni. Menu plein écran, thème noir ou crème mémorisé, effets de verre et uniquement des typographies sans serif.

## Ouvrir et publier
Servir ce dossier avec un serveur HTTP statique. Pour GitHub Pages : branche `main`, dossier `/` (racine). Les liens et ressources restent relatifs au dépôt. Le site compilé fonctionne sans installation ni accès à un CDN.

## Modifier
Les pages HTML, `style.css`, `experience.css`, `services.css`, `script.js`, `experience.js`, `services.js` et `metal-buttons.css` sont directement éditables. La page orbitale utilise `deroulement.html`, `process-page.css` et `process-page.js`. Le module 3D compilé est `assets/horizon.js` ; sa source lisible est `src/horizon.js`. Pour le reconstruire : `npm install`, puis `npm run build:horizon`. Les boutons utilisent `assets/metal-buttons.js` ; la source lisible est `src/metal-buttons.js`, à reconstruire avec `npm run build:buttons`. Les versions de Paper Shaders, Three.js, GSAP et esbuild sont fixées dans `package.json`.

## Références 21st.dev
Les codes de Horizon Hero Section, Radial Orbital Timeline et Liquid Metal Button ont été fournis par le propriétaire du site. Les quatre autres composants sont réimplémentés à partir de leurs aperçus, avec son accord. Détails et liens dans `21ST-CREDITS.md` et la page Informations.

## Démonstration et contact
Les visuels des douze projets et les coordonnées de contact sont fictifs. Le parcours présenté à propos de BNP Paribas, de la SNCF, du logo « label gare remarquable » et des plus de 100 clients a été communiqué par le propriétaire du site. Le même formulaire est présenté sur l’accueil et la page « Un projet ? », où les prix et le champ budget sont retirés. Les liens de service conservent la prestation choisie dans le brief. Le formulaire produit un brief téléchargeable, sans envoi de message. Ajouter les coordonnées réelles et connecter un service d’envoi pour recevoir les demandes. Compléter les informations de l’éditeur avant l’utilisation commerciale. Le tarif affiché est de 40 €/heure ; les estimations restent indicatives.

## Accessibilité
Animations réduites avec `prefers-reduced-motion`, moteurs suspendus hors écran, pause au focus de la galerie, commandes clavier, formulaires étiquetés et repli visuel sans WebGL. Les dossiers s’ouvrent au clic, au toucher ou au clavier ; Échap les referme. Les fiches proposent les prestations et ouvrent une demande de devis avec le service présélectionné. Le thème est la seule préférence stockée dans le navigateur. Aucun outil de suivi ajouté.

## Ajustements du 29 octobre 2026
Voix d’agence, six services dont Illustrations, tarif à 40 €/h et estimation cohérente. Formulaires limités à 1 000 caractères avec compteur visible et hauteur de saisie plafonnée. Les notices de démonstration sont retirées des formulaires ; le récapitulatif et la page Informations décrivent toujours le téléchargement sans envoi. Flèches d’entrée, commandes de galerie, compteurs de détail et boutons de pause orbitale retirés.
