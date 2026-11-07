#!/usr/bin/env bash
# ==============================================================================
# TradeSphere AI — PostgreSQL Automated Backup & Disaster Recovery Tool
# ==============================================================================
# Usage:
#   ./scripts/backup_restore.sh backup
#   ./scripts/backup_restore.sh restore /path/to/backup_file.sql.gz
#   ./scripts/backup_restore.sh list
#   ./scripts/backup_restore.sh verify /path/to/backup_file.sql.gz
# ==============================================================================

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups/postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-tradesphere}"
DB_USER="${DB_USER:-tradesphere_app}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

mkdir -p "${BACKUP_DIR}"

log() {
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $1"
}

backup() {
  local timestamp
  timestamp=$(date -u +"%Y%m%d_%H%M%SZ")
  local backup_file="${BACKUP_DIR}/tradesphere_${DB_NAME}_${timestamp}.sql.gz"
  local checksum_file="${backup_file}.sha256"

  log "Initiating PostgreSQL backup for database '${DB_NAME}' on ${DB_HOST}:${DB_PORT}..."

  # Perform pg_dump with gzip compression
  PGPASSWORD="${DB_PASSWORD:-}" pg_dump \
    -h "${DB_HOST}" \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -d "${DB_NAME}" \
    --no-owner \
    --no-privileges \
    --clean \
    --if-exists \
    --format=plain | gzip -9 > "${backup_file}"

  # Generate SHA-256 Checksum for tamper verification
  sha256sum "${backup_file}" | awk '{print $1}' > "${checksum_file}"

  local size
  size=$(du -h "${backup_file}" | awk '{print $1}')
  log "Backup completed successfully: ${backup_file} (${size})"
  log "SHA-256 Checksum: $(cat "${checksum_file}")"

  prune_old_backups
}

verify_backup() {
  local target_file="$1"
  local checksum_file="${target_file}.sha256"

  if [ ! -f "${target_file}" ]; then
    log "ERROR: Backup file not found: ${target_file}"
    exit 1
  fi

  log "Verifying integrity of ${target_file}..."
  if [ -f "${checksum_file}" ]; then
    local expected_hash
    expected_hash=$(cat "${checksum_file}")
    local actual_hash
    actual_hash=$(sha256sum "${target_file}" | awk '{print $1}')
    if [ "${expected_hash}" != "${actual_hash}" ]; then
      log "ERROR: Checksum mismatch! Expected ${expected_hash}, calculated ${actual_hash}"
      exit 1
    fi
    log "Checksum verified: MATCH (${actual_hash})"
  fi

  # Test gzip integrity
  gzip -t "${target_file}"
  log "Gzip decompression test passed: archive is integral."
}

restore() {
  local target_file="$1"

  verify_backup "${target_file}"

  echo "=================================================================="
  echo " WARNING: Restoring will overwrite existing data in '${DB_NAME}'!"
  echo " Target archive: ${target_file}"
  echo "=================================================================="
  read -r -p "Are you sure you wish to continue with restoration? (yes/no): " confirmation
  if [ "${confirmation}" != "yes" ]; then
    log "Restoration aborted by operator."
    exit 0
  fi

  log "Commencing database restore into '${DB_NAME}'..."
  gunzip -c "${target_file}" | PGPASSWORD="${DB_PASSWORD:-}" psql \
    -h "${DB_HOST}" \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -d "${DB_NAME}" \
    --single-transaction \
    -v ON_ERROR_STOP=1

  log "Database restoration successfully applied and verified."
}

list_backups() {
  log "Available backups in ${BACKUP_DIR}:"
  ls -lh "${BACKUP_DIR}"/*.sql.gz 2>/dev/null || log "No backups found."
}

prune_old_backups() {
  log "Pruning backups older than ${RETENTION_DAYS} days..."
  find "${BACKUP_DIR}" -name "*.sql.gz" -mtime +"${RETENTION_DAYS}" -delete
  find "${BACKUP_DIR}" -name "*.sha256" -mtime +"${RETENTION_DAYS}" -delete
  log "Pruning completed."
}

case "${1:-}" in
  backup)
    backup
    ;;
  restore)
    if [ -z "${2:-}" ]; then
      echo "Usage: $0 restore <path_to_backup.sql.gz>"
      exit 1
    fi
    restore "$2"
    ;;
  verify)
    if [ -z "${2:-}" ]; then
      echo "Usage: $0 verify <path_to_backup.sql.gz>"
      exit 1
    fi
    verify_backup "$2"
    ;;
  list)
    list_backups
    ;;
  *)
    echo "Usage: $0 {backup|restore <file>|verify <file>|list}"
    exit 1
    ;;
esac
