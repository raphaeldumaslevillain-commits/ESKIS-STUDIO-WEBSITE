# Publication officielle — studio-eskis.fr

Préparation du 30 octobre 2026. Le dépôt contient le site statique compilé. Aucun réglage DNS, aucune boîte mail et aucun contrat d’hébergement n’ont été modifiés pendant cette préparation.

## Fichiers prêts
- CNAME : studio-eskis.fr.
- URL canonique, Open Graph, sitemap.xml et robots.txt sur https://studio-eskis.fr/.
- Favicon SVG/PNG/ICO, icône Apple et manifeste.
- Page 404, ressources locales et liens relatifs compatibles avec un hébergement statique.
- Formulaires adressés à contact@studio-eskis.fr, traitement des erreurs et secours par messagerie.

## Ce qui reste à finaliser
1. Choisir et activer l’hébergement public. GitHub Pages n’était pas encore actif lors du contrôle : l’URL github.io répondait 404. Le domaine répondait avec une erreur TLS et ses enregistrements ne pointaient pas vers GitHub Pages.
2. Configurer le domaine et attendre le certificat HTTPS, puis vérifier les pages et les médias sur le domaine réel.
3. Activer la réception de contact@studio-eskis.fr et le destinataire FormSubmit. Le test réel d’envoi a reçu HTTP 521 ; la réception n’est donc pas vérifiée.
4. Compléter les mentions légales avec les données réelles de l’activité. Le propriétaire a indiqué qu’elles ne sont pas encore disponibles. Ne pas considérer la page provisoire comme complète.

## Si GitHub Pages est retenu
Dans le dépôt ESKIS-STUDIO-WEBSITE, Settings → Pages : publier depuis main, dossier /, puis déclarer studio-eskis.fr comme domaine personnalisé. Le fichier CNAME est déjà présent.

Dans la zone DNS du domaine, remplacer les enregistrements web concurrents de l’apex par les quatre enregistrements A GitHub Pages :

| Type | Nom | Valeur |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | raphaeldumaslevillain-commits.github.io |

Conserver les enregistrements de messagerie MX, SPF, DKIM et DMARC du prestataire mail. Ne pas remplacer un enregistrement mail par un réglage web. Activer « Enforce HTTPS » lorsque le certificat est prêt.

Documentation officielle : https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

Si l’hébergement OVH est retenu à la place, transférer le contenu de ce dossier à la racine publique de l’hébergement activé et suivre ses réglages DNS/SSL ; ne pas appliquer en parallèle les adresses GitHub ci-dessus.

## Vérification finale
Ouvrir l’accueil, les huit projets, les services, le déroulement et le contact depuis le domaine public. Tester le retour depuis un dossier et depuis un projet suivant, le thème clair/sombre et l’affichage mobile. Vérifier l’absence d’erreurs ou de médias manquants. Contrôler robots.txt, sitemap.xml et favicon. Envoyer un message de test depuis chaque formulaire et vérifier sa réception, sa présentation et l’adresse de réponse avant de considérer la publication terminée.
