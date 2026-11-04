# Instructions & Règles du Projet ScenoPlan (CAO)

## 🛡️ Stratégie Git & Workflow de Branches (STRICTE)

Ce projet utilise un modèle **GitFlow épuré** pour garantir la stabilité de la production (`cao.frame-perfect.fr`) et un historique propre.

### 1. Rôles des Branches

| Branche | Rôle | Règles |
| :--- | :--- | :--- |
| **`main`** | **Production** (déployée sur GitHub Pages) | 🚫 **Push direct INTERDIT**. Reçoit uniquement des fusions depuis `develop` validées par l'utilisateur. |
| **`develop`** | **Tampon d'intégration** | Branche pivot où sont fusionnées les fonctionnalités testées. |
| **`feat/<nom>`** | Nouvelle fonctionnalité | Branche créée depuis `develop`. |
| **`fix/<nom>`** | Correction de bug | Branche créée depuis `develop` (ou `hotfix/` depuis `main`). |
| **`chore/<nom>`** | Tâche technique / maintenance | Branche créée depuis `develop`. |

---

### 2. Norme des Conventional Commits

Tous les commits doivent respecter la spécification **Conventional Commits** :

```text
<type>(<scope optionnel>): <description courte à l'impératif>
```

#### Types autorisés :
- **`feat:`** Nouvelle fonctionnalité visible pour l'utilisateur (ex: `feat(catalog): add tv stand with nintendo switch and controllers`).
- **`fix:`** Correction d'un bug (ex: `fix(2d-canvas): reverse spotlight beam cone direction for PAR and followspot`).
- **`chore:`** Tâche de maintenance, configuration ou nettoyage (ex: `chore: remove public roadmap modal and toolbar button`).
- **`docs:`** Modification ou ajout de documentation (ex: `docs: define git branching and conventional commit rules`).
- **`style:`** Formatage, espacement, retouches CSS sans changement de logique métier.
- **`refactor:`** Refactorisation de code sans ajout de fonctionnalité ni correction de bug.
- **`perf:`** Amélioration des performances.

---

### 3. Workflow Opérationnel

1. **Avant de commencer une tâche** :
   Toujours basculer sur `develop` et créer une branche dédiée :
   ```bash
   git checkout develop
   git checkout -b feat/nom-de-la-feature
   ```
2. **Commit** :
   Rédiger des commits atomiques au format Conventional Commit.
3. **Intégration** :
   Faire une Pull Request ou fusionner dans `develop` une fois la tâche validée.
4. **Validation Remote** :
   Ne jamais pousser sur un dépôt distant sans l'accord explicite de l'utilisateur.
