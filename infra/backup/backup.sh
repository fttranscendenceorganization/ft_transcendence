#!/bin/bash
set -e

DATE=$(date +"%Y-%m-%d_%H-%M")
BACKUP_NAME="netpong-db-${DATE}.sql.gz"

echo "📦 Starting PostgreSQL backup..."

pg_dump \
  -h "$DB_HOST" \
  -U "$POSTGRES_USER" \
  "$POSTGRES_DB" | gzip > "${BACKUP_DIR}/${BACKUP_NAME}"

echo "✅ Local backup created:"
ls -lh "${BACKUP_DIR}/${BACKUP_NAME}"