w# Project Setup Guide

## Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL 14+

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourorg/project.git
cd project
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` file:
```
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your-super-secret-key
PORT=3000
NODE_ENV=development
```

4. Run database migrations:
```bash
npm run migrate
```

5. Seed the database (optional):
```bash
npm run seed
```

## Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## Testing
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## Folder Structure
```
workspace/
├── api/           # API route handlers
├── services/      # Business logic
├── middleware/    # Express middleware
├── utils/         # Utility functions
├── config/        # Configuration files
└── docs/          # Documentation
```

## Common Issues

### Port already in use
If you get "EADDRINUSE" error, kill the process:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <process-id> /F

# Linux/Mac
lsof -ti:3000 | xargs kill
```

### Database connection failed
Make sure PostgreSQL is running and credentials are correct in `.env` file.
