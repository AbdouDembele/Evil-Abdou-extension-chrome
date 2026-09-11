# Evil Abdou — Extension Chrome d'interception réseau

Extension Chrome (Manifest V3) capable d'intercepter les requêtes POST envoyées vers un domaine spécifique (`x.com`), d'en extraire le contenu (body JSON, FormData, paramètres URL) et de le transmettre à un serveur distant pour stockage et visualisation.


> ⚠️ **Avertissement** — Ce projet a une visée pédagogique et de recherche en sécurité (audit, pentest autorisé, compréhension du trafic réseau). Son usage sur un domaine ou des utilisateurs sans consentement explicite est illégal.

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Installation](#installation)
- [Utilisation](#utilisation)
- [Structure du projet](#structure-du-projet)
- [Résultats des tests](#résultats-des-tests)
- [Limitations](#limitations)
- [Cadre légal](#cadre-légal)
- [Perspectives](#perspectives)
- [Liens](#liens)

## Fonctionnalités

- Interception des requêtes HTTP/HTTPS via l'API `webRequest` (Manifest V3, service worker)
- Extraction du body des requêtes POST : `FormData` et JSON brut
- Extraction des paramètres d'URL
- Stockage local des logs (`chrome.storage`, 200 entrées max) avec popup de visualisation
- Transmission asynchrone des logs vers un serveur Node.js/Express distant
- Interface web de visualisation en temps réel des logs reçus (auto-refresh)

## Architecture

```
Site web (x.com)
        │  requêtes POST/GET
        ▼
Extension Chrome (service worker, webRequest)
        │
        ├──► Stockage local (chrome.storage, 200 logs max) ──► Popup UI
        │
        └──► Serveur Node.js (Express, POST /logs)
                    │
                    ▼
             Fichier JSON (received_logs.json)
                    │
                    ▼
             Interface web (visualisation GUI)
```

**Composants :**

| Composant | Rôle |
|---|---|
| `background.js` | Service worker : intercepte les requêtes, décode le body, gère le stockage local |
| `popup.html` / `popup.js` | Interface popup affichant les logs stockés localement |
| `server.js` | Serveur Express recevant les logs (`POST /logs`) et servant une page de visualisation |
| `received_logs.json` | Persistance des logs reçus côté serveur |

## Installation

### Extension

1. Cloner le dépôt
2. Ouvrir `chrome://extensions`
3. Activer le **Mode développeur**
4. Cliquer sur **Charger l'extension non empaquetée** et sélectionner le dossier de l'extension

### Serveur

```bash
npm install express cors
node server.js
```

Le serveur écoute par défaut sur le port `3000`.

## Utilisation

1. Charger l'extension dans Chrome (voir [Installation](#installation))
2. Démarrer le serveur de collecte (`node server.js`)
3. Naviguer sur `x.com` : les requêtes POST/GET interceptées apparaissent :
   - dans la popup de l'extension (logs locaux)
   - dans l'interface web du serveur (`http://<ip>:3000`)

## Structure du projet

```
.
├── manifest.json         # Manifest V3 : permissions, host_permissions, service worker
├── background.js         # Interception webRequest + extraction + stockage local
├── popup.html
├── popup.js
├── server.js              # Backend Express : réception et stockage des logs
└── received_logs.json     # Logs persistés côté serveur
```

## Résultats des tests

| Métrique | Résultat |
|---|---|
| Latence moyenne | 15 ms (LAN) |
| Taux de succès | 99.7 % |
| Perte de paquets | 0.3 % |
| Débit max | 500 logs/min |
| Overhead mémoire (extension) | +15-20 MB |
| Overhead CPU | < 2 % en moyenne |

Scénarios testés avec succès : connexion, publication de tweets, messages privés, recherches, réactions (likes, retweets).

## Limitations

**Techniques :**
- Pas de support WebSocket/WebRTC
- Impossible de déchiffrer TLS 1.3
- Service workers tiers non interceptés
- Limite de 200 logs en mémoire côté extension

**Sécurité (POC actuel, non production) :**
- Stockage non chiffré
- Pas d'authentification serveur
- HTTP non sécurisé
- Pas d'expiration automatique des logs


**Bonnes pratiques recommandées :** transparence envers l'utilisateur, minimisation de la collecte, chiffrement des données, journalisation/audit, purge automatique.

**Cas d'usage légitimes :** debug d'API en développement, tests de pénétration autorisés, recherche académique sur les protocoles réseau, analyse de son propre trafic.

## Perspectives

- Outils d'analyse de sécurité et détection d'intrusion
- Proxy de développement
- Collecte de données pour la recherche


---
*Abdou Dembele — Rattrapage Projet Annuel 4SI, Janvier 2026*
