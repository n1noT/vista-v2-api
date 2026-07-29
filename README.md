# 🏆 VISTA - Backend API

*The robust engine powering the VISTA football prediction platform.*

## ⚙️ About VISTA API

While the frontend provides the thrill of the game, this backend is the brain of the operation. Built with **NestJS**, the VISTA API handles everything from data synchronization and scoring algorithms to secure user authentication and administrative controls.

It serves as the single source of truth for the platform, ensuring that league standings, user predictions, match odds, and global leaderboards are processed accurately and efficiently. By integrating directly with external football data providers, the API keeps the platform's data fresh, allowing users to make their predictions based on real-world schedules and results.

## ✨ Key Features

- **Advanced Prediction Engine:** Processes and validates user submissions for league tables and tournament brackets, calculating potential points and outcomes.
- **Dynamic Scoring & Leaderboards:** Automatically updates global and league-specific rankings based on real-world match results.
- **External Data Synchronization:** Seamlessly fetches and integrates live fixtures, teams, and odds from external football data sources.
- **Role-Based Access Control (RBAC):** Secure JWT-based authentication ensuring players only see their data, while granting admins full control over seasons, teams, and user management.
- **Admin Command Center:** Dedicated API endpoints for administrators to manage seasons, trigger data syncs, update odds, and oversee all platform activity.

## 🛠 Tech Stack

- **Framework:** [NestJS](https://nestjs.com/) (TypeScript)
- **Database ORM:** [Prisma](https://www.prisma.io/)
- **Database:** PostgreSQL (assumed via Prisma)
- **API Testing:** [Bruno](https://www.usebruno.com/) (Collections included in the `/bruno` directory)
- **Testing:** Jest (Unit & E2E)
- **Containerization:** Docker

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (LTS recommended)
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```

### Environment Setup

Create a `.env` file in the root directory based on the provided example:
```bash
cp .env.example .env
```
Ensure you configure your database connection string and JWT secrets appropriately.

### Database Migration (Prisma)

Initialize the database schema and apply migrations:
```bash
npx prisma migrate dev
# Or to just generate the Prisma client:
npx prisma generate
```

### Running the Application

```bash
# Development
npm run start

# Watch mode (Recommended for dev)
npm run start:dev

# Production mode
npm run start:prod
```
The API will typically run on `http://localhost:3000`.

## 🧪 API Testing with Bruno

Instead of Postman, VISTA uses **Bruno** for API exploration and testing. 
1. Download [Bruno](https://www.usebruno.com/).
2. Open the `/bruno` folder in the Bruno app.
3. Select your environment (`local` or `prod`) from the environments tab to start interacting with the endpoints (Auth, Predictions, Leagues, Admin, etc.).

## 🐳 Docker Deployment

The backend is ready to be containerized and deployed:

```bash
# Build the API image
docker build -t vista-api .

# Run the container
docker run -p 3000:3000 --env-file .env vista-api
```
