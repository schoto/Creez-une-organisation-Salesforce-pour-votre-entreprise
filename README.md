# Projet Salesforce - OpenClassrooms

Ce dépôt contient le code source d’un projet Salesforce développé dans le cadre de ma formation.  
Il inclut des **composants LWC**, des **classes Apex**, et leurs **tests unitaires**.

---

## 📂 Contenu du projet

### 🔹 Classes Apex
- **getUserProfileController** : retourne le profil de l’utilisateur courant.
- **opportunityProductController** : expose des méthodes pour lister et supprimer des `OpportunityLineItem`.
- **Tests Apex** : couverture des classes via des scénarios de création et suppression de données.

### 🔹 LWC
- **opportunityProductViewer**
  - Affiche les produits liés à une opportunité.
  - Mise en évidence des alertes quand la quantité demandée dépasse le stock disponible.
  - Actions disponibles : voir un produit ou supprimer une ligne.
- **kazbekRandomGen** (exemple) : génération aléatoire (utilisé pour tester la mécanique LWC).

---

## ⚙️ Installation et déploiement

1. Cloner le dépôt :
   ```bash
   git clone https://github.com/schoto/Creez-une-organisation-Salesforce-pour-votre-entreprise.git
   cd Creez-une-organisation-Salesforce-pour-votre-entreprise
