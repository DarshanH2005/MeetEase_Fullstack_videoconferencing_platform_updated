# MeetEase - Video Conferencing Platform

A modern, full-stack video conferencing platform built with React, Next.js, and Node.js. MeetEase provides seamless video calling experience with real-time communication features.

## ✨ Features

- 🎥 **High-Quality Video Calls** - Crystal clear video and audio communication
- 👥 **Multi-Participant Support** - Host meetings with multiple participants
- 💬 **Real-time Chat** - In-meeting chat functionality
- 🔒 **Secure Authentication** - User authentication with Clerk
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🎨 **Modern UI** - Beautiful, intuitive interface with Material-UI
- 🚀 **Real-time Communication** - Powered by Socket.io for instant updates
- 📊 **Meeting Controls** - Mute/unmute, video on/off, screen sharing
- 🔗 **Easy Meeting Links** - Share meeting links to invite participants

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** - React framework for production
- **React 19** - Latest React with concurrent features
- **Material-UI v6** - Component library for beautiful UI
- **Framer Motion** - Smooth animations and transitions
- **Socket.io Client** - Real-time communication
- **Styled Components** - CSS-in-JS styling

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Socket.io** - Real-time bidirectional communication
- **Clerk** - Authentication and user management

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Clerk account** for authentication

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/meetease-platform.git
cd meetease-platform
```

### 2. Install dependencies

**Frontend:**

```bash
cd frontend
npm install
```

**Backend:**

```bash
cd backend
npm install
```

### 3. Environment Setup

**Frontend:**

```bash
cd frontend
cp .env.example .env.local
```

**Backend:**

```bash
cd backend
cp .env.example .env
```

Fill in the environment variables with your actual values.

### 4. Start the development servers

**Backend (Terminal 1):**

```bash
cd backend
npm run dev
```

**Frontend (Terminal 2):**

```bash
cd frontend
npm run dev
```

The application will be available at:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

## 📁 Project Structure

```
meetease-platform/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/          # Next.js pages and API routes
│   │   ├── utils/          # Utility functions and helpers
│   │   └── styles/         # Global styles and themes
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js backend application
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Data models
│   │   └── routes/         # API routes
│   └── package.json
└── README.md
```

## 🔧 Available Scripts

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Backend

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

## 🌐 Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Backend (Railway/Render/Heroku)

1. Push your code to GitHub
2. Connect your repository to your hosting service
3. Set environment variables
4. Deploy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 📞 Support

For support, create an issue in this repository.

---

**Built with ❤️ for seamless video communication**
