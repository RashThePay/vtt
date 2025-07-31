# 🏴‍☠️ High Seas VTT (آب‌های آزاد)

A specialized Virtual Tabletop (VTT) platform for the Persian pirate strategy game "آب‌های آزاد" (High Seas).

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+
- PostgreSQL (for production)

### Installation & Setup

1. **Clone and Install Dependencies**
   ```bash
   git clone <your-repo>
   cd vtt
   npm install --legacy-peer-deps
   ```

2. **Environment Configuration**
   ```bash
   # Backend
   cp apps/backend/.env.example apps/backend/.env
   # Edit apps/backend/.env with your database settings
   
   # Frontend  
   cp apps/frontend/.env.example apps/frontend/.env
   ```

3. **Start Development Servers**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start individually
   npm run dev:backend  # http://localhost:3001
   npm run dev:frontend # http://localhost:5173
   ```

## 📁 Project Structure

```
vtt/
├── apps/
│   ├── backend/           # Node.js/Express API server
│   │   ├── src/
│   │   │   └── index.ts   # Main server file
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── package.json
│   └── frontend/          # React/Vite application
│       ├── src/
│       │   ├── components/
│       │   ├── store/     # Redux store
│       │   └── App.tsx
│       └── package.json
├── packages/
│   └── shared/            # Shared TypeScript types
│       └── src/types.ts
└── docs/                  # Documentation
    └── VTT Implementation Guide.md
```

## 🛠 Technology Stack

### Frontend
- **React 18** - UI framework
- **Material-UI** - Component library with RTL support
- **Redux Toolkit** - State management
- **Socket.io Client** - Real-time communication
- **Vite** - Build tool
- **TypeScript** - Type safety

### Backend
- **Node.js + Express** - Web server
- **Socket.io** - WebSocket communication
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Winston** - Logging

### Infrastructure
- **Monorepo** - Workspace-based project structure
- **TypeScript** - Shared types across frontend/backend
- **ESLint** - Code linting
- **Jest** - Testing framework

## 🎮 Game Features (Planned)

### ✅ Completed
- [x] Project setup and monorepo structure
- [x] Frontend/Backend communication via WebSockets
- [x] Basic UI with Persian language support
- [x] Redux store with game state management
- [x] Database schema design
- [x] Development environment setup

### 🔄 In Progress
- [ ] Database setup and Prisma migrations
- [ ] Authentication system
- [ ] Game board component (20x20 grid)
- [ ] Ship management interface

### 📋 Planned
- [ ] **Game Board & Map System**
  - 20x20 interactive grid map
  - Fog of war mechanics
  - Dynamic weather system
  - Ship token management

- [ ] **Ship Management**
  - Digital ship sheets
  - Point-buy ship builder
  - Cargo and crew management
  - Ship condition tracking

- [ ] **Automated Game Mechanics**
  - Dice rolling engine
  - Combat resolution (Artillery + Boarding phases)
  - Movement calculations with wind effects
  - Trade price calculations

- [ ] **Multiplayer Features**
  - Real-time game state synchronization
  - Player turn management
  - Game master tools
  - Chat system

- [ ] **Persian Language Support**
  - RTL text rendering
  - Persian number display
  - Bilingual interface (Persian/English)

## 🔧 Development Commands

```bash
# Install dependencies
npm install --legacy-peer-deps

# Development
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start frontend only (port 5173)
npm run dev:backend      # Start backend only (port 3001)

# Building
npm run build            # Build both applications
npm run build:frontend   # Build frontend only
npm run build:backend    # Build backend only

# Database (when ready)
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run database migrations  
npm run db:studio        # Open Prisma Studio

# Testing & Linting
npm run test             # Run tests
npm run lint             # Run ESLint
```

## 🌐 Development Servers

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **Backend Health Check**: http://localhost:3001/health

## 📝 Environment Variables

### Backend (.env)
```bash
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
DATABASE_URL="postgresql://username:password@localhost:5432/highseas_dev"
JWT_SECRET="your-super-secret-jwt-key"
```

### Frontend (.env)
```bash
VITE_BACKEND_URL=http://localhost:3001
VITE_APP_NAME="High Seas VTT"
```

## 🚧 Development Status

This project is in **Phase 1: Foundation** development. The basic infrastructure is complete and both development servers are running successfully.

**Current Status**: ✅ Ready for feature development

**Next Steps**:
1. Set up PostgreSQL database
2. Run Prisma migrations
3. Implement authentication system
4. Create game board component
5. Build ship management interface

## 📖 Documentation

- [📋 Complete Implementation Guide](docs/VTT%20Implementation%20Guide.md) - Detailed technical specification
- [🎲 Game Rules](docs/آب‌های%20آزاد.md) - Persian game rules and mechanics

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript for all new code
3. Maintain Persian language support
4. Test thoroughly before committing
5. Update documentation as needed

## 📄 License

MIT License - See LICENSE file for details

---

*Built with ❤️ for the Persian tabletop gaming community*
