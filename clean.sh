#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════════════╗
# ║           NETPONG — Clean Script                                     ║
# ║   Removes everything setup.sh created — back to a clean state       ║
# ╚══════════════════════════════════════════════════════════════════════╝

set -euo pipefail

R='\033[0;31m'; G='\033[0;32m'; Y='\033[1;33m'; C='\033[0;36m'
BOLD='\033[1m'; DIM='\033[2m'; X='\033[0m'

ok()   { echo -e "${G}  ✓  $1${X}"; }
warn() { echo -e "${Y}  ⚠  $1${X}"; }
inf()  { echo -e "  ${DIM}$1${X}"; }
die()  { echo -e "${R}  ✗  $1${X}"; exit 1; }

# ── LOCATE ROOT ───────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR"
[ -n "${1:-}" ] && ROOT="$1"

ENV_DIR="$ROOT/infra/env"
CERTS_DIR="$ROOT/infra/nginx/certs"
INIT_ELK="$ROOT/init-elk.sh"

# ── BANNER ────────────────────────────────────────────────────────────
clear
echo ""
echo -e "${R}${BOLD}"
echo "  ██████╗██╗     ███████╗ █████╗ ███╗   ██╗"
echo " ██╔════╝██║     ██╔════╝██╔══██╗████╗  ██║"
echo " ██║     ██║     █████╗  ███████║██╔██╗ ██║"
echo " ██║     ██║     ██╔══╝  ██╔══██║██║╚██╗██║"
echo " ╚██████╗███████╗███████╗██║  ██║██║ ╚████║"
echo "  ╚═════╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝"
echo -e "${X}"
echo -e "  ${DIM}This will remove all generated .env files, certs, and data folders${X}"
echo ""
echo -e "  ${BOLD}What will be deleted:${X}"
echo -e "  ${R}→${X} infra/env/backend.env"
echo -e "  ${R}→${X} infra/env/database.env"
echo -e "  ${R}→${X} infra/env/backup.env"
echo -e "  ${R}→${X} infra/env/nginx.env"
echo -e "  ${R}→${X} infra/nginx/certs/nginx.crt + nginx.key"
echo -e "  ${R}→${X} init-elk.sh"
echo -e "  ${R}→${X} ./data/  ${DIM}(local data folders if they exist)${X}"
echo ""
echo -e "  ${Y}${BOLD}System paths (/opt/netpong, /etc/netpong) will be asked separately.${X}"
echo ""
echo -ne "  ${BOLD}Are you sure? [y/N]: ${X}"
read -r CONFIRM
[[ "$CONFIRM" =~ ^[Yy]$ ]] || { echo -e "\n  ${DIM}Cancelled.${X}\n"; exit 0; }

echo ""

# ── REMOVE ENV FILES ──────────────────────────────────────────────────
echo -ne "  Removing infra/env/*.env .......... "
REMOVED=0
for f in backend.env database.env backup.env nginx.env; do
  if [ -f "$ENV_DIR/$f" ]; then
    rm -f "$ENV_DIR/$f"
    REMOVED=$((REMOVED+1))
  fi
done
[ $REMOVED -gt 0 ] && ok "$REMOVED file(s) removed" || inf "none found — already clean"

# ── REMOVE CERTS ──────────────────────────────────────────────────────
echo -ne "  Removing nginx/certs/ ............. "
CERT_REMOVED=0
for f in nginx.crt nginx.key cert.pem key.pem; do
  if [ -f "$CERTS_DIR/$f" ]; then
    rm -f "$CERTS_DIR/$f"
    CERT_REMOVED=$((CERT_REMOVED+1))
  fi
done
[ $CERT_REMOVED -gt 0 ] && ok "$CERT_REMOVED cert file(s) removed" || inf "none found — already clean"

# ── REMOVE init-elk.sh ────────────────────────────────────────────────
echo -ne "  Removing init-elk.sh .............. "
if [ -f "$INIT_ELK" ]; then
  rm -f "$INIT_ELK"
  ok "removed"
else
  inf "not found — already clean"
fi

# ── REMOVE LOCAL DATA FOLDER ──────────────────────────────────────────
if [ -d "$ROOT/data" ]; then
  echo ""
  echo -ne "  ${Y}Found ./data/ folder — delete it? [y/N]: ${X}"
  read -r DEL_DATA
  if [[ "$DEL_DATA" =~ ^[Yy]$ ]]; then
    rm -rf "$ROOT/data"
    ok "./data/ removed"
  else
    inf "Skipped ./data/"
  fi
fi

# ── SYSTEM PATHS ──────────────────────────────────────────────────────
SYS_PATHS=(
  "/opt/netpong"
  "/etc/netpong"
)

FOUND_SYS=false
for p in "${SYS_PATHS[@]}"; do
  [ -d "$p" ] && FOUND_SYS=true && break
done

if [ "$FOUND_SYS" = true ]; then
  echo ""
  warn "System paths found:"
  for p in "${SYS_PATHS[@]}"; do
    [ -d "$p" ] && echo -e "  ${DIM}  $p${X}"
  done
  echo ""
  echo -ne "  ${Y}Delete system paths with sudo? [y/N]: ${X}"
  read -r DEL_SYS
  if [[ "$DEL_SYS" =~ ^[Yy]$ ]]; then
    if sudo -v 2>/dev/null; then
      for p in "${SYS_PATHS[@]}"; do
        if [ -d "$p" ]; then
          sudo rm -rf "$p"
          ok "$p removed"
        fi
      done
    else
      warn "sudo failed — could not remove system paths"
      warn "Run manually: sudo rm -rf /opt/netpong /etc/netpong"
    fi
  else
    inf "Skipped system paths"
  fi
fi

# ── REVERT COMPOSE FILES ──────────────────────────────────────────────
COMPOSE_FILES=(
  "infra/compose/docker-compose.yml"
  "infra/compose/docker-compose.elk.yml"
  "infra/compose/docker-compose.monitoring.yml"
)

echo ""
echo -ne "  Reverting patched compose files ...  "
if command -v git >/dev/null 2>&1 && git -C "$ROOT" rev-parse --git-dir >/dev/null 2>&1; then
  REVERTED=0
  for f in "${COMPOSE_FILES[@]}"; do
    if [ -f "$ROOT/$f" ]; then
      git -C "$ROOT" checkout -- "$f" 2>/dev/null && REVERTED=$((REVERTED+1)) || true
    fi
  done
  [ $REVERTED -gt 0 ] && ok "$REVERTED compose file(s) restored to git state" || inf "nothing to revert"
else
  warn "Not a git repo — cannot revert compose files automatically"
  warn "Restore manually: git checkout -- infra/compose/docker-compose*.yml"
fi

# ── DONE ──────────────────────────────────────────────────────────────
echo ""
echo -e "${G}${BOLD}  ╔══════════════════════════════════════════════════════╗"
echo -e "  ║   ✓  Clean complete. Ready for a fresh setup.       ║"
echo -e "  ╚══════════════════════════════════════════════════════╝${X}"
echo ""
echo -e "  Run setup again anytime:"
echo -e "  ${C}./setup.sh${X}"
echo ""
