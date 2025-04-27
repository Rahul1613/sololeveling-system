<<<<<<< HEAD
# Solo Leveling System

A gamified personal development platform inspired by the popular manhwa "Solo Leveling". This application allows users to level up, complete quests, manage their shadow army, acquire items, and complete fitness challenges to advance in their personal development journey.

## Features

- **User Registration and Login**: Secure authentication via email, Google, or Facebook
- **User Dashboard**: Display user stats, progress bars, and allow stat point allocation
- **Quest System**: Daily quests, emergency quests, and hidden quests with rewards
- **Inventory System**: Manage weapons, potions, and shadow army items
- **Shadow Army Management**: Summon, equip, level up, and manage your shadow army
- **Marketplace**: Purchase weapons, potions, or other valuable items
- **Leveling System**: Gain XP by completing quests and tasks
- **Fitness Proof Verification**: Submit video proof of fitness task completion
- **Real-Time Notifications**: Receive updates about quest status, level-ups, and rewards
- **Penalty System**: Face consequences for failing quests

## Tech Stack

### Backend
- Node.js with Express
- MongoDB for database
- JWT for authentication
- Socket.io for real-time features
- Multer for file uploads

### Frontend
- React.js with Redux for state management
- Material UI for styling
- Three.js for 3D effects
- Socket.io-client for real-time updates

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/solo-leveling-system.git
cd solo-leveling-system
```

2. Install backend dependencies
```
cd server
npm install
```

3. Create a .env file in the server directory with the following variables
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/solo-leveling-system
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

4. Install frontend dependencies
```
cd ../client
npm install
```

5. Start the development servers

Backend:
```
cd ../server
npm run dev
```

Frontend:
```
cd ../client
npm start
```

## Usage

1. Register a new account or login with existing credentials
2. Accept daily quests to start gaining experience
3. Complete quests to earn rewards and level up
4. Allocate stat points to increase your abilities
5. Acquire and manage shadows for your shadow army
6. Purchase items from the marketplace to enhance your character

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by the "Solo Leveling" manhwa by Chugong
- Special thanks to all contributors and the open-source community
=======
# sololeveling-system
sololeveling system
>>>>>>> 9e1583f4aef9de2e2b13422109c6013061e65ae3
