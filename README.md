# ESKIS — When creativity connect us.

Portfolio statique en HTML, CSS et JavaScript : 16 pages, 8 projets issus des fichiers fournis. Ressources, polices et bibliothèques hébergées localement. Domaine préparé : https://studio-eskis.fr/.

## État de livraison
Version 5.0.0, préparation du 30 octobre 2026. Le code est prêt à être servi par un hébergement statique. La mise en service officielle dépend encore du domaine/HTTPS, de l’activation et d’un test concluant du formulaire, et des informations légales réelles. Consulter PUBLICATION.md pour les réglages et les vérifications restantes.

## Navigation et expérience
Logo ESKIS, liens directs des pages sur ordinateur, changement de thème et bouton burger. Menu plein écran sur mobile. Le retour d’un projet conserve sa page d’origine, le dossier ouvert et la position de défilement. Un parcours entre plusieurs projets conserve ce point de retour. La préférence de thème et ce contexte temporaire restent dans le navigateur.

Ouverture Horizon, titres animés, dossiers de services, galerie 4:3 monochrome qui retrouve ses couleurs au survol ou au focus, formulaire limité à 1 000 caractères. Quatre catégories : Illustrations, Identité visuelle, Packaging et Print ; un cinquième dossier propose les autres possibilités graphiques. Aucun estimateur ou sélecteur de budget. Le tarif apparaît uniquement en petit avec les deux formulaires.

## Projets
projects.json contient les médias et les réglages des packagings ; project-copy.json contient les textes « Le projet » et « L’intention créative », rédigés à partir des briefs du propriétaire. Les pages présentent au maximum deux visuels, sauf Pelote qui conserve ses sept slides d’origine dans l’ordre, au format 16:9, sans intervalle et avec les arrondis uniquement aux extrémités de l’ensemble. Les grandes images d’ouverture gardent leur proportion ; les visuels secondaires utilisent un cadre 4:3 commun avec un survol discret.

Les images sont des JPEG optimisés ; les fichiers de travail AI, PSD, InDesign et les PDF lourds ne sont pas publiés. Les originaux restent dans les dossiers de l’utilisateur. Sources factuelles et distinction entre données publiques et briefs : PROJECT-SOURCES.md.

## Packaging et footer
Les vues 3D se chargent uniquement sur les pages concernées. Rotation, zoom, clavier, réinitialisation, plein écran, fond transparent et image de repli. MOKI : 20 × 7 × 5 cm.

Le footer adapte « Halftone Wordmark Footer » fourni par le propriétaire : masque issu des véritables tracés du logo ESKIS, trame réactive au pointeur, ressorts et onde au clic. Arrêt hors écran et prise en compte de la réduction des animations. Les liens et contrôles restent en HTML natif. Le favicon reprend le « e » et l’étoile du logo, avec exports SVG, PNG, ICO et icône Apple.

## Formulaire
contact.js envoie les champs à https://formsubmit.co/ajax/contact@studio-eskis.fr, avec sujet ESKIS, réponse vers l’e-mail du visiteur et présentation en tableau. Aucun secret n’est présent dans les sources. La confirmation ne s’affiche qu’après acceptation par le service. Une erreur conserve le message et propose un e-mail prérempli. Ce lien de secours ouvre la messagerie du visiteur ; il ne garantit pas une livraison automatique.

Le test réel du 30 octobre 2026 a reçu une erreur HTTP 521 de FormSubmit : aucune réception n’a été confirmée. Ne pas présenter l’envoi comme opérationnel avant activation du destinataire et réception vérifiée d’un message test.

## Développement
Servir ce dossier par HTTP, par exemple `python3 -m http.server 4381 --bind 127.0.0.1`. Le site compilé fonctionne sans installation ni CDN. Pour reconstruire les modules : `npm install`, puis `npm run build:horizon`, `npm run build:buttons` ou `npm run build:packaging`. Versions fixées dans package.json. Les pages, styles et scripts sont directement éditables.

## Sources et licences
Références 21st.dev, licences et attributions dans 21ST-CREDITS.md. Logo fourni par son propriétaire. DM Sans sous SIL Open Font License. Aucun outil publicitaire ou de mesure d’audience ajouté.
