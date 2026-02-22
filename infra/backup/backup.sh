#!/bin/bash
set -e

DATE=$(date +"%Y-%m-%d_%H-%M")
BACKUP_NAME="netpong-db-${DATE}.sql.gz"

echo "📦 Starting PostgreSQL backup..."

export PGPASSWORD="$PGPASSWORD"

pg_dump \
  -h "$DB_HOST" \
  -p "$POSTGRES_PORT" \
  -U "$POSTGRES_USER" \
  "$POSTGRES_DB" | gzip > "${BACKUP_DIR}/${BACKUP_NAME}"

unset PGPASSWORD

echo "✅ Local backup created:"
ls -lh "${BACKUP_DIR}/${BACKUP_NAME}"