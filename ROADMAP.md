# 🗺️ Roadmap de Développement — ScenoPlan

> **ScenoPlan** est une solution web professionnelle de conception scénographique 2D et de visualisation 3D en temps réel pour l'événementiel, le spectacle vivant, les salons professionnels et les réceptions.

---

## 📌 Vue d'Ensemble des Phases

| Phase | Domaine | Statut | Priorité |
| :--- | :--- | :---: | :---: |
| **Phase 1** | **Affichage & Immersion 3D** (Split-View, Visite ZQSD, Animation DMX, Sols) | ✅ **Livré** | 🔥 Terminé |
| **Phase 2** | **Outils Métier Événementiel** (Rangées de chaises, Rigging truss, Jauge ERP) | 🔄 **Prochaine étape** | 🔥 Haute |
| **Phase 3** | **Gestion Technique & Fiches Prestataires** (BOM, Inventaire matériel, Cotes) | 📅 Planifié | ⚡ Moyenne |
| **Phase 4** | **Interopérabilité & Écosystème 3D** (Export glTF/OBJ, Import DXF/DWG) | 💡 À l'étude | ⚡ Moyenne |

---

## 🚀 Phase 1 : Affichage, Navigation & Immersion 3D — ✅ LIVRÉ

Toutes les fonctionnalités de la Phase 1 sont entièrement implémentées et opérationnelles.

### 1.1 Vue partagée Split-View 2D / 3D simultanée ✅
* **Statut** : **Livré**
* **Fonctionnalités livrées** :
  * Bouton dédié **Split 2D/3D** dans la barre supérieure et raccourci clavier universel **F4**.
  * Affichage côte à côte : plan 2D vectoriel interactif à gauche (50%) et viewport 3D Three.js à droite (50%).
  * **Synchronisation temps réel immédiate** : tout déplacement, rotation, redimensionnement ou ajout de mobilier depuis la 2D se répercute instantanément dans la 3D sans rechargement.
  * Outils 2D (sélection, déplacement, mesures, cloisons, zones) restent 100% actifs en split-view.

### 1.2 Mode Visite Immersive (First-Person ZQSD à 1,70 m) ✅
* **Statut** : **Livré**
* **Fonctionnalités livrées** :
  * Bouton **Visite ZQSD** dans la barre d'outils 3D flottante.
  * Déplacement fluide au clavier avec support simultané **AZERTY (Z, Q, S, D)**, **QWERTY (W, A, S, D)** et touches **Flèches directionnelles**.
  * Orientation du regard à la souris (Look drag fluide).
  * Hauteur des yeux fixée précisément à **1,70 m** pour une simulation de spectateur / régisseur réaliste.
  * HUD d'assistance dédié en bas d'écran avec touche **[Échap]** ou bouton pour quitter instantanément.

### 1.3 Animation & Show Lumière en Direct (Live DMX Simulator) ✅
* **Statut** : **Livré**
* **Fonctionnalités livrées** :
  * Bouton **Live Show** avec bascule automatique en ambiance nocturne de spectacle.
  * **Lyres asservies robotisées** : balayage angulaire Pan/Tilt continu et fluide (~120° d'oscillation).
  * **Faisceaux volumétriques dynamiques** : cycle de couleurs spectrales RGB (HSL), modulation de l'intensité et du cône lumineux.
  * **Projecteurs PAR 64 et poursuite** : pulsation d'ambiance et balayage de mire sur la scène.

### 1.4 Textures de Sol Photo-réalistes Configurables ✅
* **Statut** : **Livré**
* **Fonctionnalités livrées** :
  * Menu déroulant **Sol** directement accessible dans le viewport 3D.
  * Générateur procédural HD (toiles Canvas 512×512 sans dépendance réseau externe) :
    1. **Grille Studio** : sol sombre haute précision avec quadrillage technique.
    2. **Parquet Scène** : lattes de chêne vernies, veinures de bois et joints d'assemblage.
    3. **Moquette Rouge VIP** : velours rouge profond pour galas, cérémonies et réceptions officielles.
    4. **Moquette Bleue Expo** : revêtement textile bleu présidentiel pour salons et congrès.
    5. **Dalles Béton** : sol industriel lissé pour hangars et halls d'exposition.
    6. **Gazon Plein Air** : pelouse naturelle texturée pour festivals extérieurs et garden-parties.

---

## 📐 Phase 2 : Outils Métier & Scénographie Événementielle

Des fonctionnalités intelligentes accélérant le traçage et garantissant la conformité réglementaire.

### 2.1 Générateur Automatique de Rangées de Chaises (Parterre / Conférence) ✅
* **Statut** : **Livré**
* **Fonctionnalités livrées** :
  * Bouton dédié **Parterre Chaises** dans la barre supérieure et barre d'outils 2D (raccourci `Alt+C`).
  * Paramétrage complet : nombre de rangées, sièges par rangée, espacement inter-sièges et profondeur entre rangées.
  * Création automatique de l'**allée centrale de circulation / évacuation** conforme ERP (1,40 m / 2 UP).
  * **Numérotation automatique** des rangées et des sièges (Rangée A Siège 1, 2, 3...).
  * **Calcul de jauge et métriques en temps réel** (nombre de places, dimensions totales, surface occupée, conformité ERP).
  * Annulation intégrale du parterre en 1 seul `Ctrl+Z` (Undo atomique).
  * Synchronisation 2D et 3D temps réel instantanée.

### 2.2 Accrochage aux Ponts de Scène (Truss Rigging)
* **Concept** : Fixer des projecteurs, enceintes line-array et écrans directement sous les structures en hauteur.
* **Fonctionnalités** :
  * Définition de la hauteur de pont (ex: 4,50 m, 6,00 m).
  * "Snap" magnétique des projecteurs sous les tubes d'aluminium.
  * Orientation angulaire du faisceau vers un point de mire sur la scène.

### 2.3 Calculateur de Jauge & Sécurité ERP (Établissements Recevant du Public)
* **Concept** : Assister l'organisateur dans le calcul de la capacité d'accueil maximale.
* **Fonctionnalités** :
  * Calcul automatique des surfaces utiles hors mobilier.
  * Estimation des ratios réglementaires (ex: 3 pers./m² debout en concert, 1 pers./m² en cocktail).
  * Détection d'allées trop étroites (< 1,20 m) avec alerte visuelle de non-conformité.

---

## 📑 Phase 3 : Gestion Technique & Fiches Prestataires

Faciliter la transmission du dossier technique aux équipes de montage, loueurs et régisseurs.

### 3.1 Nomenclature & Bon de Commande Matériel Automatique (BOM)
* **Concept** : Générer instantanément l'inventaire quantitatif du matériel posé.
* **Détails exportés** :
  * Nombre de tables (rectangulaires 6p/8p, rondes, mange-debout) avec leurs noms.
  * Nombre total de chaises, fauteuils et canapés.
  * Linéaire de barrières Vauban, Heras et cloisons modulaires.
  * Équipements audiovisuels (lyres, PAR, poursuites, PC régie, écrans).
  * Export direct aux formats **PDF technique récapitulatif** et tableau **Excel / CSV**.

### 3.2 Gestion des Hauteurs Sous Plafond & Détection de Collisions
* **Concept** : Prévenir les erreurs de gabarit avant l'arrivée sur site.
* **Fonctionnalités** :
  * Saisie de la hauteur libre sous plafond du bâtiment.
  * Alerte visuelle orange/rouge si un mât de projecteur, un pont ou un barnum excède la hauteur disponible.

---

## 🌐 Phase 4 : Interopérabilité & Écosystème 3D

### 4.1 Export 3D Universel (glTF / GLB / OBJ)
* **Concept** : Permettre d'exporter la maquette numérique 3D complète.
* **Bénéfice** : Ouvrir et peaufiner les scènes directement dans **Blender**, **Cinema 4D**, **SketchUp** ou des moteurs temps réel (**Unreal Engine**, **Unity**).

### 4.2 Import de Fonds de Plan Architecturaux (DXF / DWG / SVG)
* **Concept** : Importer le plan de masse officiel de la salle ou du parc des expositions en arrière-plan avec calibrage d'échelle métrique.

---

## 💡 Historique des Dernières Mises à Jour Livrées

* ✅ **Moteur 3D temps réel Three.js** avec caméra orbitale et modes jour/nuit.
* ✅ **Faisceaux volumétriques réalistes** sur les lyres robotisées, projecteurs PAR à volets et poursuites.
* ✅ **Silhouettes humaines PNJ à l'échelle (1,75 m)** : orateur avec micro, agent sécurité fluo, technicien régie avec intercom, public.
* ✅ **Matériel informatique détaillé** : PC portables, station de travail PC et tours gaming ARGB avec paroi en verre trempé.
* ✅ **Élévation automatique intelligente** : détection des tables, bureaux et estrades pour poser le matériel directement sur les plateaux.
* ✅ **Impression haute définition des noms de tables** directement sur les surfaces de plateaux.
