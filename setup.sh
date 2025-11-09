#!/bin/bash
set -e

echo "🚀 Music Hub Setup Script"
echo "=========================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Creating .env from template..."
    cat > .env << 'EOF'
# Database - UPDATE THIS with your PostgreSQL connection string
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/music_hub?schema=public"

# OpenSearch - UPDATE THIS if your OpenSearch is running on a different URL
OPENSEARCH_URL="http://localhost:9200"

# API
PORT=4000
WEB_ORIGIN="http://localhost:3000"
EOF
    echo "✅ Created .env file. Please update DATABASE_URL with your PostgreSQL credentials."
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
cd packages/db
pnpm db:generate
cd ../..

# Try to push schema (will fail if DB is not configured)
echo "🗄️  Attempting to push database schema..."
cd packages/db
if pnpm db:push --skip-generate 2>&1 | grep -q "P1001\|P1010\|connection"; then
    echo "⚠️  Database connection failed. Please:"
    echo "   1. Make sure PostgreSQL is running"
    echo "   2. Update DATABASE_URL in .env with correct credentials"
    echo "   3. Create the database: createdb music_hub (or use your preferred method)"
    echo "   4. Run: pnpm --filter @music-hub/db db:push"
else
    echo "✅ Database schema pushed successfully!"
    
    # Seed database
    echo "🌱 Seeding database..."
    if pnpm db:seed; then
        echo "✅ Database seeded successfully!"
    else
        echo "⚠️  Database seeding failed. You can run it manually with: pnpm --filter @music-hub/db db:seed"
    fi
fi
cd ../..

# Build API
echo "🏗️  Building API..."
cd apps/api
if pnpm build; then
    echo "✅ API built successfully!"
else
    echo "⚠️  API build failed. Check the errors above."
fi
cd ../..

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your database credentials"
echo "2. Run database migrations: pnpm --filter @music-hub/db db:push"
echo "3. Seed database: pnpm --filter @music-hub/db db:seed"
echo "4. (Optional) Start OpenSearch and run indexer: pnpm --filter @music-hub/indexer backfill"
echo "5. Start API: pnpm --filter @music-hub/api dev"

