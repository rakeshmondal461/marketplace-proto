# Marketplace Backend API

A production-ready MERN stack marketplace backend with TypeScript, Express, Sequelize ORM, and MySQL database with robust migration support.

## 🚀 Features

- **TypeScript** - Full type safety across the codebase
- **Express.js** - Fast, unopinionated web framework
- **Sequelize ORM** - Database management with TypeScript support
- **MySQL** - Reliable relational database
- **JWT Authentication** - Secure user authentication
- **OAuth Integration** - Google, Facebook, Instagram login support
- **Database Migrations** - Production-safe schema management
- **Docker Support** - Containerized deployment
- **Health Checks** - Application monitoring endpoints

## 📋 Prerequisites

### For Docker Setup
- Docker (v20.10+)
- Docker Compose (v2.0+)

### For Local Setup
- Node.js (v18+)
- npm or pnpm
- MySQL (v8.0+)

## 🛠️ Installation & Setup

### Option 1: Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd marketplace-proto
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` if needed (default values work for Docker setup)

3. **Start the application**
   ```bash
   docker-compose up --build
   ```
   
   This will:
   - Start MySQL database
   - Run database migrations automatically
   - Start the backend API server

4. **Access the API**
   - API: http://localhost:4000
   - Health check: http://localhost:4000/health

5. **Stop the application**
   ```bash
   docker-compose down
   ```
   
   To remove volumes (⚠️ deletes database data):
   ```bash
   docker-compose down -v
   ```

---

### Option 2: Local Development (Without Docker)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd marketplace-proto/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up MySQL database**
   
   Create a MySQL database and user:
   ```sql
   CREATE DATABASE marketplace_db;
   CREATE USER 'marketplace_user'@'localhost' IDENTIFIED BY 'marketplace_pass';
   GRANT ALL PRIVILEGES ON marketplace_db.* TO 'marketplace_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

4. **Create environment file**
   ```bash
   cp ../.env.example .env
   ```
   
   Update `.env` for local setup:
   ```env
   PORT=4000
   JWT_SECRET=your_secret_key_here
   
   DB_HOST=localhost
   DB_NAME=marketplace_db
   DB_USER=marketplace_user
   DB_PASSWORD=marketplace_pass
   
   NODE_ENV=development
   ```

5. **Run database migrations**
   ```bash
   npm run migrate
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The API will be available at http://localhost:4000

---

## 🗄️ Database Migrations

This project uses **Sequelize CLI** with **TypeScript** for database migrations.

### Migration Commands

```bash
# Check migration status
npm run migrate:status

# Run all pending migrations
npm run migrate

# Rollback last migration
npm run migrate:undo

# Rollback all migrations (⚠️ use with caution)
npm run migrate:undo:all

# Generate new migration file
npm run migration:generate add-your-feature-name
```

### Creating a New Migration

1. **Generate migration file**
   ```bash
   npm run migration:generate add-user-phone-number
   ```

2. **Edit the generated TypeScript file** in `src/database/migrations/`
   ```typescript
   import { QueryInterface, DataTypes } from 'sequelize';

   export async function up(queryInterface: QueryInterface): Promise<void> {
     await queryInterface.addColumn('users', 'phoneNumber', {
       type: DataTypes.STRING,
       allowNull: true,
     });
   }

   export async function down(queryInterface: QueryInterface): Promise<void> {
     await queryInterface.removeColumn('users', 'phoneNumber');
   }
   ```

3. **Run the migration**
   ```bash
   npm run migrate
   ```

### Migration Best Practices

✅ **DO:**
- Always provide a `down` method for rollback
- Test migrations locally before deploying
- Make migrations idempotent when possible
- Add indexes for foreign keys

❌ **DON'T:**
- Never modify existing migrations that have been deployed
- Don't delete data without a backup strategy
- Avoid renaming columns directly (use add + copy + remove pattern)

📖 **Full migration guide:** [docs/database-migrations.md](./docs/database-migrations.md)

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── database/
│   │   ├── config.js              # Database configuration
│   │   ├── dbConfig.ts            # Sequelize instance
│   │   ├── migrate.ts             # Migration runner
│   │   └── migrations/            # Migration files (TypeScript)
│   │       ├── helpers/           # Migration helper utilities
│   │       └── *.ts               # Individual migrations
│   ├── modules/
│   │   ├── auth/                  # Authentication module
│   │   ├── user/                  # User module
│   │   ├── product/               # Product module
│   │   ├── category/              # Category module
│   │   └── order/                 # Order module
│   ├── middleware/                # Express middleware
│   ├── app.ts                     # Express app setup
│   ├── index.ts                   # Entry point
│   └── routes.ts                  # Route registration
├── docs/                          # Documentation
├── scripts/                       # Utility scripts
├── .sequelizerc                   # Sequelize CLI config
├── tsconfig.json                  # TypeScript config
├── package.json                   # Dependencies
└── Dockerfile                     # Docker configuration
```

---

## 🔌 API Endpoints

### Health Check
- `GET /health` - Application health status

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/oauth/google` - Google OAuth
- `POST /api/auth/oauth/facebook` - Facebook OAuth
- `POST /api/auth/oauth/instagram` - Instagram OAuth

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (auth required)
- `PUT /api/products/:id` - Update product (auth required)
- `DELETE /api/products/:id` - Delete product (auth required)

### Categories
- `GET /api/categories` - List all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category (admin only)
- `PUT /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)

### Orders
- `GET /api/orders` - List user orders (auth required)
- `GET /api/orders/:id` - Get order by ID (auth required)
- `POST /api/orders` - Create order (auth required)

---

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server with hot reload

# Production
npm run build            # Compile TypeScript to JavaScript
npm start                # Start production server

# Database Migrations
npm run migrate          # Run pending migrations
npm run migrate:undo     # Rollback last migration
npm run migrate:status   # Check migration status
npm run migration:generate  # Create new migration file
```

---

## 🐳 Docker Commands

```bash
# Start services
docker-compose up                    # Start in foreground
docker-compose up -d                 # Start in background (detached)
docker-compose up --build            # Rebuild and start

# Stop services
docker-compose stop                  # Stop services
docker-compose down                  # Stop and remove containers
docker-compose down -v               # Stop and remove containers + volumes

# View logs
docker-compose logs                  # View all logs
docker-compose logs -f backend       # Follow backend logs
docker-compose logs -f db            # Follow database logs

# Execute commands in containers
docker-compose exec backend npm run migrate        # Run migrations
docker-compose exec backend npm run migrate:status # Check migration status
docker-compose exec db mysql -u root -p            # Access MySQL CLI
```

---

## 🔐 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | API server port | `4000` | No |
| `NODE_ENV` | Environment mode | `development` | No |
| `DB_HOST` | Database host | `db` | Yes |
| `DB_NAME` | Database name | `marketplace_db` | Yes |
| `DB_USER` | Database user | `marketplace_user` | Yes |
| `DB_PASSWORD` | Database password | `marketplace_pass` | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | - | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | - | No |
| `FACEBOOK_CLIENT_ID` | Facebook OAuth client ID | - | No |
| `FACEBOOK_CLIENT_SECRET` | Facebook OAuth secret | - | No |
| `INSTAGRAM_CLIENT_ID` | Instagram OAuth client ID | - | No |
| `INSTAGRAM_CLIENT_SECRET` | Instagram OAuth secret | - | No |

---

## 🧪 Testing

```bash
# Run migrations on test database
NODE_ENV=test npm run migrate

# Check migration status
npm run migrate:status
```

---

## 🚀 Production Deployment

### Pre-Deployment Checklist

- [ ] Set strong `JWT_SECRET` in production environment
- [ ] Update database credentials
- [ ] Configure OAuth credentials (if using)
- [ ] Backup existing database
- [ ] Test migrations on staging environment
- [ ] Review migration logs

### Deployment Steps

1. **Build Docker image**
   ```bash
   docker-compose build
   ```

2. **Start services**
   ```bash
   docker-compose up -d
   ```
   
   Migrations run automatically on startup!

3. **Verify deployment**
   ```bash
   # Check health
   curl http://localhost:4000/health
   
   # Check logs
   docker-compose logs -f backend
   
   # Verify migrations
   docker-compose exec backend npm run migrate:status
   ```

### Rollback Procedure

If deployment fails:

```bash
# Rollback last migration
docker-compose exec backend npm run migrate:undo

# Restart backend
docker-compose restart backend
```

---

## 🛡️ Database Schema

### Users Table
- `id` - Primary key
- `name` - User's full name
- `email` - Unique email address
- `passwordHash` - Hashed password
- `role` - User role (buyer, seller, admin)
- `createdAt`, `updatedAt` - Timestamps

### Categories Table
- `id` - Primary key
- `name` - Category name
- `slug` - Unique URL-friendly identifier
- `createdAt`, `updatedAt` - Timestamps

### Products Table
- `id` - Primary key
- `title` - Product title
- `description` - Product description
- `imageUrl` - Product image URL
- `price` - Product price
- `sellerId` - Foreign key to users
- `categoryId` - Foreign key to categories
- `createdAt`, `updatedAt` - Timestamps

### Orders Table
- `id` - Primary key
- `type` - Order type (buy, sell)
- `buyerId` - Foreign key to users
- `sellerId` - Foreign key to users
- `productId` - Foreign key to products
- `quantity` - Order quantity
- `totalPrice` - Total order price
- `createdAt`, `updatedAt` - Timestamps

---

## 📚 Documentation

- [Database Migrations Guide](./docs/database-migrations.md) - Comprehensive migration documentation
- [Migration Helpers](./src/database/migrations/helpers/migration-helpers.ts) - Reusable migration utilities

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Create migrations for schema changes
4. Test migrations locally
5. Submit a pull request

---

## 📝 License

ISC

---

## 🆘 Troubleshooting

### Database Connection Issues

**Problem:** Cannot connect to database

**Solution:**
```bash
# For Docker
docker-compose logs db
docker-compose restart db

# For local setup
# Verify MySQL is running
sudo systemctl status mysql
```

### Migration Errors

**Problem:** Migration fails

**Solution:**
```bash
# Check migration status
npm run migrate:status

# View detailed logs
docker-compose logs backend

# Rollback and retry
npm run migrate:undo
npm run migrate
```

### Port Already in Use

**Problem:** Port 4000 or 3306 already in use

**Solution:**
```bash
# Change port in .env file
PORT=5000

# Or stop conflicting service
sudo lsof -i :4000
kill -9 <PID>
```

---

## 📞 Support

For issues or questions:
1. Check the [Database Migrations Guide](./docs/database-migrations.md)
2. Review existing migrations in `src/database/migrations/`
3. Check Docker logs: `docker-compose logs -f`

---

**Built with ❤️ using TypeScript, Express, and Sequelize**
