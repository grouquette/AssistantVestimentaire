🌦️ Assistant Météo Vestimentaire
Une application intelligente développée en TypeScript qui recommande les tenues vestimentaires idéales pour le lendemain, en combinant les prévisions météo, la localisation, les profils de plusieurs personnes (âge, genre) et leur niveau de frilosité.
L'application s'adapte et s'améliore également au fil du temps en fonction des retours sur les jours précédents.

🚀 Fonctionnalités principales
Prévision à J+1 : Anticipe la météo du lendemain pour préparer sa tenue à l'avance.

Gestion multi-profils : Enregistre et gère plusieurs personnes (enfants, proches) avec leurs propres caractéristiques (âge, genre).

Indice de frilosité personnalisé : Ajuste les recommandations selon que la personne est frileuse ou non.

Apprentissage et ajustement : Modifie et affine les suggestions en fonction des résultats et du confort ressenti les jours précédents.

Données météo précises : Connexion à l'API Open-Meteo pour récupérer les prévisions météorologiques en temps réel et sans clé d'API obligatoire.

🛠️ Stack Technique
* **Frontend** : React 19, TypeScript, Tailwind CSS v4, Lucide React (icônes), Motion (animations)
* **Backend** : Node.js, Express, TypeScript (exécuté via `tsx`)
* **Outils & Build** : Vite, PostCSS / Autoprefixer
* **APIs & Services** : 
  * [Open-Meteo API](https://open-meteo.com/) pour les prévisions météorologiques
  * Google GenAI SDK (`@google/genai`) pour la logique de recommandation intelligente

📦 Installation et Lancement
Suis ces étapes pour exécuter le projet localement :

Cloner le dépôt :

Bash
git clone https://github.com/grouquette/AssistantVestimentaire.git
cd AssistantVestimentaire

Installer les dépendances :

Bash
npm install
Lancer l'application en mode développement :

Bash
npm run dev

💡 Utilisation
Gère tes profils : Ajoute les membres de ton foyer en renseignant leur âge, leur genre et leur sensibilité au froid (frilosité).

Consulte la météo du lendemain : L'application interroge Open-Meteo en fonction de ta localisation.

Reçois ta recommandation : Découvre la tenue conseillée pour chaque profil.

Ajuste si besoin : Modifie la recommandation si elle ne collait pas parfaitement à la réalité, pour aider le système à s'ajuster.

🤝 Contribuer
Les contributions sont les bienvenues ! N'hésite pas à ouvrir une issue ou à proposer une pull request.

N'hésite pas à adapter les sections sur les technologies exactes de ton stack (si tu utilises React, Node, etc.) !
