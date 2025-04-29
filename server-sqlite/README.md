# Solo Leveling System - SQLite3 Backend

This is the SQLite3 backend implementation for the Solo Leveling System, a gamified personal development platform inspired by the Solo Leveling manhwa/novel.

## Project Structure

```
server-sqlite/
├── config/             # Configuration files
│   └── database.js     # SQLite3 database configuration with Sequelize
├── controllers/        # Controller logic (to be implemented)
├── db/                 # Database related files
│   ├── init-db.js      # Database initialization script
│   └── sample-data/    # Sample data for database initialization
│       ├── users.js    # Sample users
│       ├── items.js    # Sample marketplace items
│       ├── skills.js   # Sample skills
│       └── titles.js   # Sample titles
├── middleware/         # Middleware functions
│   └── auth.js         # Authentication middleware
├── models/             # Database models
│   ├── user.model.js   # User model
│   ├── item.model.js   # Item model
│   ├── skill.model.js  # Skill model
│   ├── title.model.js  # Title model
│   ├── userItem.model.js # User-Item relationship model
│   ├── userSkill.model.js # User-Skill relationship model
│   └── userTitle.model.js # User-Title relationship model
├── routes/             # API routes
│   ├── auth.routes.js  # Authentication routes
│   ├── user.routes.js  # User routes
│   ├── marketplace.routes.js # Marketplace routes
│   ├── skills.routes.js # Skills routes
│   └── titles.routes.js # Titles routes
├── uploads/            # Directory for uploaded files (avatars, etc.)
├── package.json        # Project dependencies
├── server.js           # Main server file
└── README.md           # This file
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Navigate to the server-sqlite directory
3. Install dependencies:

```bash
npm install
```

### Database Initialization

Initialize the database with sample data:

```bash
npm run init-db
```

This will create the SQLite database file and populate it with sample data.

### Running the Server

Start the server in development mode:

```bash
npm run dev
```

Or in production mode:

```bash
npm start
```

The server will be running at http://localhost:5000 by default.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/profile` - Get user profile (requires authentication)

### Users

- `GET /api/users/stats` - Get user stats (requires authentication)
- `PUT /api/users/stats` - Update user stats (requires authentication)
- `GET /api/users/leaderboard` - Get global leaderboard

### Marketplace

- `GET /api/marketplace/items` - Get all marketplace items
- `GET /api/marketplace/featured` - Get featured items
- `GET /api/marketplace/recommended` - Get recommended items based on user rank
- `POST /api/marketplace/buy` - Buy an item (requires authentication)
- `GET /api/marketplace/inventory` - Get user's inventory (requires authentication)
- `POST /api/marketplace/equip` - Equip an item (requires authentication)
- `POST /api/marketplace/use` - Use a consumable item (requires authentication)

### Skills

- `GET /api/skills/available` - Get available skills based on user rank
- `GET /api/skills/user` - Get user's skills (requires authentication)
- `GET /api/skills/equipped` - Get equipped skills (requires authentication)
- `POST /api/skills/buy` - Buy a skill (requires authentication)
- `POST /api/skills/equip` - Equip a skill (requires authentication)
- `POST /api/skills/unequip` - Unequip a skill (requires authentication)
- `POST /api/skills/use` - Use a skill (requires authentication)
- `POST /api/skills/level-up` - Level up a skill (requires authentication)

### Titles

- `GET /api/titles/available` - Get available titles based on user performance
- `GET /api/titles/user` - Get user's titles (requires authentication)
- `POST /api/titles/buy` - Buy a title (requires authentication)
- `POST /api/titles/equip` - Equip a title (requires authentication)
- `POST /api/titles/unequip` - Unequip a title (requires authentication)

## Authentication

The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header of your requests:

```
Authorization: Bearer <token>
```

## Error Handling

All endpoints return appropriate HTTP status codes and error messages in case of failure.

## Data Models

### User

- `id`: Primary key
- `username`: User's username
- `email`: User's email
- `password`: Hashed password
- `rank`: User's rank (E, D, C, B, A, S)
- `level`: User's level
- `experience`: User's experience points
- `gold`: User's gold
- `health`: User's health points
- `mana`: User's mana points
- `strength`: User's strength stat
- `intelligence`: User's intelligence stat
- `agility`: User's agility stat
- `hunts`: Number of hunts completed
- `kills`: Number of monsters killed
- `dungeons`: Number of dungeons completed
- `bossKills`: Number of boss monsters killed
- `soloHunts`: Number of solo hunts completed
- `skillPoints`: Number of skill points available
- `avatar`: User's avatar image
- `isAdmin`: Whether the user is an admin

### Item

- `id`: Primary key
- `name`: Item name
- `description`: Item description
- `price`: Item price in gold
- `rarity`: Item rarity (common, uncommon, rare, epic, legendary)
- `category`: Item category (weapon, armor, accessory, consumable, material)
- `image`: Item image
- `effects`: JSON string of item effects
- `level_required`: Minimum level required to use
- `rank_required`: Minimum rank required to use
- `is_featured`: Whether the item is featured
- `is_recommended`: Whether the item is recommended
- `quantity_available`: Number of items available (-1 for unlimited)

### Skill

- `id`: Primary key
- `name`: Skill name
- `description`: Skill description
- `type`: Skill type (active, passive)
- `rarity`: Skill rarity (common, uncommon, rare, epic, legendary)
- `price`: Skill price in gold
- `rank_required`: Minimum rank required to learn
- `cooldown`: Cooldown time in seconds
- `image`: Skill image
- `effects`: JSON string of skill effects
- `max_level`: Maximum skill level
- `level_scaling`: JSON string of how skill scales with levels

### Title

- `id`: Primary key
- `name`: Title name
- `description`: Title description
- `rarity`: Title rarity (common, uncommon, rare, epic, legendary)
- `price`: Title price in gold
- `image`: Title image
- `requirements`: JSON string of requirements to earn the title
- `bonuses`: JSON string of bonuses provided by the title

## License

This project is licensed under the ISC License.
