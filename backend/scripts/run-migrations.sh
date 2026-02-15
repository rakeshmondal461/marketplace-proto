#!/bin/bash
set -e

echo "🔄 Starting database migration process..."

# Maximum number of retries
MAX_RETRIES=5
RETRY_DELAY=3

# Function to run migrations with retry logic
run_migrations() {
  local attempt=1
  
  while [ $attempt -le $MAX_RETRIES ]; do
    echo "Attempt $attempt of $MAX_RETRIES..."
    
    if npx sequelize-cli db:migrate; then
      echo "✓ Migrations completed successfully"
      return 0
    else
      if [ $attempt -lt $MAX_RETRIES ]; then
        echo "⚠ Migration failed, retrying in ${RETRY_DELAY}s..."
        sleep $RETRY_DELAY
        attempt=$((attempt + 1))
      else
        echo "✗ Migration failed after $MAX_RETRIES attempts"
        return 1
      fi
    fi
  done
}

# Check database connection first
echo "Checking database connection..."
if npx sequelize-cli db:migrate:status; then
  echo "✓ Database connection successful"
else
  echo "✗ Cannot connect to database"
  exit 1
fi

# Run migrations
if run_migrations; then
  echo "🎉 Database is ready!"
  exit 0
else
  echo "❌ Migration process failed"
  exit 1
fi
