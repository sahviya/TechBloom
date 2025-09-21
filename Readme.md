# MindBloom 🌱

![GitHub repo size](https://img.shields.io/github/repo-size/sahviya/MindBloom?style=for-the-badge)
![GitHub issues](https://img.shields.io/github/issues/sahviya/MindBloom?style=for-the-badge)
![GitHub license](https://img.shields.io/github/license/sahviya/MindBloom?style=for-the-badge)
![Netlify Status](https://img.shields.io/netlify/your-site-id?style=for-the-badge)

**MindBloom** is an AI-powered mental wellness platform designed to help users uplift their mood, manage stress, and improve their mindset.  
It combines self-help resources, mindfulness exercises, AI guidance, and a supportive community into one personalized platform.

[🌐 Live Demo](https://mindbloomgenie.netlify.app)

---

## 🌟 Features

- **AI Genie Assistant**: Real-time chat and voice-based guidance powered by OpenAI + Google Cloud Vertex AI.  
- **Smart Journal**: Daily entries with mood tracking and AI-generated reflection prompts.  
- **Self-Help Resources**: Curated books, TED Talks, motivational videos, and short clips.  
- **Mindfulness & Breathing Exercises**: Interactive exercises to reduce stress and improve focus.  
- **Community Support Hub**: Anonymous peer support and moderated discussion forums.  
- **Motivational Dashboard**: Personalized insights, recommendations, and progress tracking.  

---

## 🎨 Screenshots

**Dashboard**
<img width="1915" height="1079" alt="Screenshot 2025-09-11 181934" src="https://github.com/user-attachments/assets/03191182-419c-492f-b8fd-269cce0a3059" />
<img width="1919" height="1079" alt="Screenshot 2025-09-12 102220" src="https://github.com/user-attachments/assets/16bc1bbe-ac85-4603-a921-c308495302ae" />




**AI Genie Assistant**  
<img width="1919" height="1079" alt="Screenshot 2025-09-12 102132" src="https://github.com/user-attachments/assets/c6f9fcc1-e751-4da8-8f9a-dde7d1ad818a" />


**Smart Journal**  
<img width="1919" height="1079" alt="Screenshot 2025-09-12 100744" src="https://github.com/user-attachments/assets/038b8e64-4957-4518-a189-f5b027aded2c" />

**Community** 
<img width="1919" height="1079" alt="Screenshot 2025-09-12 100832" src="https://github.com/user-attachments/assets/320fdfa0-c71b-48bb-8def-8191939dc28a" />
<img width="1919" height="1079" alt="Screenshot 2025-09-12 100935" src="https://github.com/user-attachments/assets/5d1570ff-47d7-4614-acbe-983b3f4d2499" />




## 🛠 Tech Stack

- **Frontend**: React.js, TypeScript, Tailwind CSS  
- **Backend**: Node.js, Express.js  
- **Database / Cloud Services**: MongoDB / Prisma, Google Cloud (Vertex AI for AI processing, hosting, and storage)  
- **AI Integration**: OpenAI API + Google Cloud Vertex AI for advanced AI functionality  
- **Deployment**: Netlify + Google Cloud  

---

## 🚀 Getting Started

### Prerequisites

- Node.js v14 or higher  
- npm or yarn  
- MongoDB or Prisma-supported database  

### Installation

1. Clone the repository:

```bash
git clone https://github.com/sahviya/MindBloom.git
cd MindBloom
Install dependencies:

bash
Copy code
npm install
# or
yarn install
Create a .env file:

ini
Copy code
REACT_APP_OPENAI_KEY=your_openai_api_key
GOOGLE_CLOUD_PROJECT=your_google_cloud_project_id
GOOGLE_CLOUD_VERTEX_KEY=your_vertex_ai_key
DATABASE_URL=your_database_connection_string
NODE_ENV=development
Run the development server:

bash
Copy code
npm run dev
Build for production:

bash
Copy code
npm run build
📂 Project Structure
bash
Copy code
MindBloom/
├── client/                  # Frontend React/TypeScript code
├── server/                  # Backend API / Express server
├── shared/                  # Shared utilities and types
├── netlify/functions/       # Serverless functions (if any)
├── prisma/                  # Database schema & migrations
├── .env.example             # Example environment variables
├── tailwind.config.ts       # Tailwind CSS configuration
├── vite.config.ts           # Vite bundler configuration
└── package.json             # Project scripts & dependencies
🤝 Contributing
Fork the repository

Create a new branch: git checkout -b feature/YourFeature

Commit your changes: git commit -m "Add feature"

Push your branch: git push origin feature/YourFeature

Open a Pull Request

Ensure code quality, follow conventions, and include tests if applicable.

📄 License
This project is licensed under the MIT License. See LICENSE for details.

📞 Contact
Sahvi Shaikh

GitHub: https://github.com/sahviya

Email: your.email@example.com

🔗 Acknowledgements
React.js – Frontend framework

Tailwind CSS – Styling

Node.js – Backend runtime

OpenAI – AI assistant integration

Google Cloud Vertex AI – AI model hosting, training, and deployment

Inspired by modern mental wellness platforms and MindBloom
