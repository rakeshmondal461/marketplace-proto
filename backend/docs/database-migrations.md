# Database Migrations Guide

This guide covers everything you need to know about managing database migrations in the marketplace application.

## Overview

We use **Sequelize CLI** for database migrations, which provides:
- ✅ Version-controlled schema changes
- ✅ Rollback capabilities
- ✅ Zero-downtime deployments
- ✅ Production-safe schema updates

## Quick Start

### Running Migrations

```bash
# Check migration status
npm run migrate:status

# Run all pending migrations
npm run migrate

# Rollback last migration
npm run migrate:undo

# Rollback all migrations (⚠️ use with caution)
npm run migrate:undo:all
```

## Creating New Migrations

### 1. Generate Migration File

```bash
npm run migration:generate add-user-phone-number
```

This creates a new migration file in `src/database/migrations/` with a timestamp prefix.

### 2. Edit Migration File

```typescript
import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Add your schema changes here
  await queryInterface.addColumn('users', 'phoneNumber', {
    type: DataTypes.STRING,
    allowNull: true,
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Reverse the changes (for rollback)
  await queryInterface.removeColumn('users', 'phoneNumber');
}
```

### 3. Test Migration

```bash
# Run the migration
npm run migrate

# Test rollback
npm run migrate:undo

# Re-run migration
npm run migrate
```

## Migration Best Practices

### ✅ DO

1. **Always provide a `down` method** for rollback capability
2. **Test migrations locally** before deploying to production
3. **Make migrations idempotent** when possible (use helper functions)
4. **Add indexes** for foreign keys and frequently queried columns
5. **Use transactions** for complex multi-step migrations
6. **Keep migrations small** and focused on one change
7. **Document breaking changes** in migration comments

### ❌ DON'T

1. **Never modify existing migrations** that have been deployed
2. **Don't delete data** without a backup strategy
3. **Avoid renaming columns directly** (use add + copy + remove pattern)
4. **Don't use model definitions** in migrations (they may change)
5. **Never skip migrations** in production

## Zero-Downtime Migration Patterns

### Adding a New Column

```typescript
// ✅ Safe - column is nullable or has default
await queryInterface.addColumn('products', 'stock', {
  type: DataTypes.INTEGER,
  allowNull: true, // or defaultValue: 0
});
```

### Removing a Column (Multi-Step)

**Step 1: Stop writing to the column** (deploy code change)
```javascript
// Remove column from model, but don't drop it yet
```

**Step 2: Drop the column** (after code is deployed)
```javascript
await queryInterface.removeColumn('products', 'oldColumn');
```

### Renaming a Column (Multi-Step)

**Step 1: Add new column**
```javascript
await queryInterface.addColumn('users', 'fullName', {
  type: Sequelize.STRING,
  allowNull: true,
});
```

**Step 2: Copy data**
```javascript
await queryInterface.sequelize.query(
  'UPDATE users SET fullName = name WHERE fullName IS NULL'
);
```

**Step 3: Update code to use new column** (deploy)

**Step 4: Remove old column**
```javascript
await queryInterface.removeColumn('users', 'name');
```

### Changing Column Type

```javascript
// For MySQL, use MODIFY
await queryInterface.sequelize.query(
  'ALTER TABLE products MODIFY COLUMN price DECIMAL(10,2)'
);
```

## Using Migration Helpers

We provide helper functions in `src/database/migrations/helpers/migration-helpers.ts`:

```typescript
import { QueryInterface, DataTypes } from 'sequelize';
import { safeAddColumn, addForeignKey } from '../helpers/migration-helpers';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Safely add column (checks if exists first)
  await safeAddColumn(queryInterface, 'products', 'featured', {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  });

  // Add foreign key with standard options
  await addForeignKey(
    queryInterface,
    'reviews',
    'productId',
    'products',
    'id',
    'CASCADE',
    'CASCADE'
  );
}
```

## Production Deployment Workflow

### Pre-Deployment Checklist

- [ ] Migrations tested on local database
- [ ] Migrations tested on staging environment
- [ ] Database backup created
- [ ] Rollback plan documented
- [ ] Team notified of deployment

### Deployment Steps

1. **Backup database**
   ```bash
   mysqldump -u user -p marketplace_db > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Run migrations** (automatic in Docker)
   ```bash
   docker-compose up --build
   ```
   
   Or manually:
   ```bash
   npm run migrate
   ```

3. **Verify migration**
   ```bash
   npm run migrate:status
   ```

4. **Monitor application logs**
   ```bash
   docker-compose logs -f backend
   ```

### Rollback Procedure

If something goes wrong:

```bash
# Rollback last migration
npm run migrate:undo

# Restart application
docker-compose restart backend
```

## Common Migration Scenarios

### Adding a New Table

```typescript
import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('reviews', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    productId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  // Add indexes
  await queryInterface.addIndex('reviews', ['productId']);
  await queryInterface.addIndex('reviews', ['userId']);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('reviews');
}
```

### Adding an Index

```typescript
import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.addIndex('products', ['createdAt'], {
    name: 'idx_products_created_at',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeIndex('products', 'idx_products_created_at');
}
```

### Modifying Data

```typescript
import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Use raw queries for data modifications
  await queryInterface.sequelize.query(`
    UPDATE users 
    SET role = 'seller' 
    WHERE email LIKE '%@seller.com'
  `);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Rollback is often not possible for data changes
  // Document this in comments
  console.log('Cannot rollback data modification');
}
```

## Troubleshooting

### Migration Fails in Production

1. Check migration logs:
   ```bash
   docker-compose logs backend
   ```

2. Verify database connection:
   ```bash
   docker-compose exec backend npm run migrate:status
   ```

3. Check for locked tables:
   ```sql
   SHOW PROCESSLIST;
   ```

### Migration Already Executed

If you need to re-run a migration:

```bash
# Mark migration as not executed (⚠️ use carefully)
npx sequelize-cli db:migrate:undo:all --to XXXXXXXXXXXXXX-migration-name.js

# Re-run migrations
npm run migrate
```

### Conflicting Migrations

If multiple developers create migrations with same timestamp:

1. Rename one migration file with a later timestamp
2. Commit and push changes
3. Coordinate with team to avoid conflicts

## Environment-Specific Migrations

Migrations run in all environments. To make environment-specific changes:

```javascript
module.exports = {
  async up(queryInterface, Sequelize) {
    const env = process.env.NODE_ENV || 'development';
    
    if (env === 'production') {
      // Production-only changes
    } else {
      // Development/staging changes
    }
  }
};
```

## Additional Resources

- [Sequelize Migrations Documentation](https://sequelize.org/docs/v6/other-topics/migrations/)
- [MySQL ALTER TABLE Documentation](https://dev.mysql.com/doc/refman/8.0/en/alter-table.html)
- Project migration helpers: `src/database/migrations/helpers/migration-helpers.ts`

## Support

For questions or issues with migrations:
1. Check this documentation
2. Review existing migrations in `src/database/migrations/`
3. Test on local database first
4. Consult with team before production deployment
