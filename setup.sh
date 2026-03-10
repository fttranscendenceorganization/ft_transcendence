#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════════════╗
# ║           NETPONG — One-Command Dev Environment Setup               ║
# ║   Run once → docker compose up --build → done.                      ║
# ╚══════════════════════════════════════════════════════════════════════╝

set -euo pipefail

# ── COLORS ────────────────────────────────────────────────────────────
R='\033[0;31m'; G='\033[0;32m'; Y='\033[1;33m'; B='\033[0;34m'
C='\033[0;36m'; M='\033[0;35m'; BOLD='\033[1m'; DIM='\033[2m'; X='\033[0m'

# ── PRINT HELPERS ─────────────────────────────────────────────────────
banner() {
  clear
  echo -e "${R}${BOLD}"
  echo "  ███╗   ██╗███████╗████████╗██████╗  ██████╗ ███╗   ██╗ ██████╗ "
  echo "  ████╗  ██║██╔════╝╚══██╔══╝██╔══██╗██╔═══██╗████╗  ██║██╔════╝ "
  echo "  ██╔██╗ ██║█████╗     ██║   ██████╔╝██║   ██║██╔██╗ ██║██║  ███╗"
  echo "  ██║╚██╗██║██╔══╝     ██║   ██╔═══╝ ██║   ██║██║╚██╗██║██║   ██║"
  echo "  ██║ ╚████║███████╗   ██║   ██║     ╚██████╔╝██║ ╚████║╚██████╔╝"
  echo "  ╚═╝  ╚═══╝╚══════╝   ╚═╝   ╚═╝      ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝ "
  echo -e "${X}"
  echo -e "  ${DIM}Dev Environment Setup — generates everything, asks what it can't guess${X}"
  echo ""
}

sec()  { echo ""; echo -e "${C}${BOLD}  ┌─ $1 ${X}"; }
line() { echo -e "${B}  │${X}"; }
inf()  { echo -e "${B}  │  ${X}${DIM}$1${X}"; }
ok()   { echo -e "${B}  │  ${X}${G}✓  $1${X}"; }
warn() { echo -e "${Y}  ⚠   $1${X}"; }
skip() { echo -e "${B}  │  ${X}${DIM}↷  skipped — placeholder kept${X}"; }
die()  { echo -e "${R}  ✗  $1${X}"; exit 1; }

gen64()  { node -e "console.log(require('crypto').randomBytes(64).toString('base64'))" 2>/dev/null || openssl rand -base64 64 | tr -d '\n'; }
genhex() { node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"   2>/dev/null || openssl rand -hex 24; }

# ask_opt LABEL HINT VARNAME FALLBACK
ask_opt() {
  local label="$1" hint="$2" varname="$3" fallback="$4" val=""
  line
  echo -e "${B}  │  ${X}${BOLD}${label}${X}"
  [ -n "$hint" ] && echo -e "${B}  │  ${X}${DIM}  ${hint}${X}"
  echo -e "${B}  │  ${X}${DIM}  Press Enter to skip${X}"
  echo -ne "${B}  │  ${X}  → "
  read -r val 2>/dev/null || true
  if [ -z "$val" ]; then
    eval "$varname='$fallback'"
    skip
  else
    eval "$varname='$val'"
    ok "Saved."
  fi
}

# ask_required LABEL HINT VARNAME DEFAULT_IF_ENTER
ask_req() {
  local label="$1" hint="$2" varname="$3" default="$4" val=""
  line
  echo -e "${B}  │  ${X}${BOLD}${label}${X}"
  [ -n "$hint" ] && echo -e "${B}  │  ${X}${DIM}  ${hint}${X}"
  echo -e "${B}  │  ${X}${DIM}  Press Enter to use: ${default}${X}"
  echo -ne "${B}  │  ${X}  → "
  read -r val 2>/dev/null || true
  [ -z "$val" ] && val="$default"
  eval "$varname='$val'"
  ok "Using: $val"
}

# ── LOCATE SCRIPT / PROJECT ROOT ──────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR"

# Accept project root as first argument
[ -n "${1:-}" ] && ROOT="$1"

ENV_DIR="$ROOT/infra/env"
CERTS_DIR="$ROOT/infra/nginx/certs"
COMPOSE_FILE="$ROOT/infra/compose/docker-compose.yml"

[ -d "$ENV_DIR" ]  || die "infra/env not found. Run from project root or pass path: ./setup.sh /path/to/project"
[ -d "$ROOT/infra/nginx" ] || die "infra/nginx/ directory not found."

# ── CHECK TOOLS ───────────────────────────────────────────────────────
command -v openssl >/dev/null 2>&1 || die "openssl is required. Install it: sudo apt install openssl"
command -v docker  >/dev/null 2>&1 || warn "docker not found — install it before running docker compose up"

# ── SUDO / PATH MODE — ask the user explicitly ────────────────────────
HAS_SUDO=false

# ── START ─────────────────────────────────────────────────────────────
banner

echo -e "  ${BOLD}What this script does:${X}"
echo -e "  ${G}✓${X} Auto-generates all secrets (JWT, DB, ELK, Grafana passwords)"
echo -e "  ${G}✓${X} Generates self-signed SSL certificate for localhost"
echo -e "  ${G}✓${X} Creates all required data folders"
echo -e "  ${G}✓${X} Writes all .env files"
echo -e "  ${G}✓${X} Asks for OAuth / API keys ${DIM}(all skippable — you can fill later)${X}"
echo ""

echo ""
echo -ne "  ${BOLD}Press Enter to start...${X} "
read -r

# ── ASK ABOUT SYSTEM PATHS ────────────────────────────────────────────
sec "System paths"
inf "Some services need folders on the host:"
inf "  /opt/netpong/  — ELK data, Prometheus, Grafana, backups"
inf "  /etc/netpong/  — elk.env, grafana.env, discord.env"
line
echo -e "${B}  │  ${X}${BOLD}Do you have permission to create these system paths?${X}"
echo -e "${B}  │  ${X}${DIM}  If yes, they will be created with sudo.${X}"
echo -e "${B}  │  ${X}${DIM}  If no, everything goes into ./data/ and compose files are auto-patched.${X}"
line
echo -ne "${B}  │  ${X}  ${BOLD}[y/N]:${X} "
read -r SYS_PATH_ANSWER 2>/dev/null || true

if [[ "$SYS_PATH_ANSWER" =~ ^[Yy]$ ]]; then
  # verify sudo actually works
  if sudo -v 2>/dev/null; then
    HAS_SUDO=true
    ok "Using system paths (/opt/netpong, /etc/netpong)"
  else
    warn "sudo failed — falling back to local ./data/ paths"
    HAS_SUDO=false
  fi
else
  HAS_SUDO=false
  ok "Using local paths — everything goes into ./data/"
fi

# ═══════════════════════════════════════════════════════════════════════
# SECTION 1 — AUTO-GENERATE SECRETS
# ═══════════════════════════════════════════════════════════════════════
sec "Generating secrets"
line

echo -ne "${B}  │  ${X}JWT access secret ......... "; JWT_ACCESS=$(gen64);   echo -e "${G}done${X}"
echo -ne "${B}  │  ${X}JWT refresh secret ........ "; JWT_REFRESH=$(gen64);  echo -e "${G}done${X}"
echo -ne "${B}  │  ${X}Database password ......... "; DB_PASS=$(genhex);     echo -e "${G}done${X}"
echo -ne "${B}  │  ${X}Elastic password .......... "; ELASTIC_PASS=$(genhex); echo -e "${G}done${X}"
echo -ne "${B}  │  ${X}Kibana system password .... "; KIBANA_PASS=$(genhex); echo -e "${G}done${X}"
echo -ne "${B}  │  ${X}Grafana admin password .... "; GRAFANA_PASS=$(genhex); echo -e "${G}done${X}"

# ═══════════════════════════════════════════════════════════════════════
# SECTION 2 — BACKUP DIRECTORY
# ═══════════════════════════════════════════════════════════════════════
sec "Backup directory"
inf "The backup container stores Postgres dumps on the host."
inf "Default: $ROOT/data/backups  (created automatically)"
inf "Or enter an absolute path like /opt/netpong/backups/postgres"
line
echo -e "${B}  │  ${X}${BOLD}Backup directory path:${X}"
echo -e "${B}  │  ${X}${DIM}  Press Enter for default: $ROOT/data/backups${X}"
echo -ne "${B}  │  ${X}  → "
read -r BACKUP_DIR_INPUT 2>/dev/null || true
if [ -z "$BACKUP_DIR_INPUT" ]; then
  BACKUP_HOST_DIR="$ROOT/data/backups"
else
  BACKUP_HOST_DIR="$BACKUP_DIR_INPUT"
fi
ok "Backup dir: $BACKUP_HOST_DIR"

# ═══════════════════════════════════════════════════════════════════════
# SECTION 3 — GOOGLE OAUTH
# ═══════════════════════════════════════════════════════════════════════
sec "Google OAuth  ${DIM}→ console.cloud.google.com${X}"
inf "Create project → APIs & Services → Credentials → OAuth 2.0 Client ID"
inf "Redirect URI: https://localhost/api/auth/google/callback"
ask_opt "Google Client ID:"     "" GOOGLE_ID     "your_google_client_id"
ask_opt "Google Client Secret:" "" GOOGLE_SECRET "your_google_client_secret"

# ═══════════════════════════════════════════════════════════════════════
# SECTION 4 — GITHUB OAUTH
# ═══════════════════════════════════════════════════════════════════════
sec "GitHub OAuth  ${DIM}→ github.com/settings/developers → OAuth Apps${X}"
inf "Homepage: https://localhost"
inf "Callback URL: https://localhost/api/auth/github/callback"
ask_opt "GitHub Client ID:"     "" GITHUB_ID     "your_github_client_id"
ask_opt "GitHub Client Secret:" "" GITHUB_SECRET "your_github_client_secret"

# ═══════════════════════════════════════════════════════════════════════
# SECTION 5 — 42 OAUTH
# ═══════════════════════════════════════════════════════════════════════
sec "42 Intra OAuth  ${DIM}→ profile.intra.42.fr/oauth/applications${X}"
inf "Redirect URI: https://localhost/api/auth/42/callback"
ask_opt "42 Client ID:"     "" INTRA_ID     "your_42_client_id"
ask_opt "42 Client Secret:" "" INTRA_SECRET "your_42_client_secret"

# ═══════════════════════════════════════════════════════════════════════
# SECTION 6 — RESEND EMAIL
# ═══════════════════════════════════════════════════════════════════════
sec "Resend Email  ${DIM}→ resend.com/api-keys${X}"
inf "Used for password reset emails."
ask_opt "Resend API Key:"             "" RESEND_KEY      "your_resend_api_key"
ask_opt "From address (no brackets):" "" RESEND_FROM_ADDR "support@localhost"

# ═══════════════════════════════════════════════════════════════════════
# SECTION 7 — DISCORD WEBHOOK (alertmanager)
# ═══════════════════════════════════════════════════════════════════════
sec "Discord Webhook  ${DIM}(for alertmanager notifications)${X}"
inf "Server Settings → Integrations → Webhooks → New Webhook → Copy URL"
ask_opt "Discord Webhook URL:" "" DISCORD_WEBHOOK "http://placeholder-no-discord"

# ═══════════════════════════════════════════════════════════════════════
# SECTION 8 — CREATE DIRECTORIES
# ═══════════════════════════════════════════════════════════════════════
sec "Creating directories"
line

# decide system vs local paths
if [ "$HAS_SUDO" = true ]; then
  OPT_BASE="/opt/netpong"
  ETC_BASE="/etc/netpong"
  echo -ne "${B}  │  ${X}/opt/netpong/* ................. "
  sudo mkdir -p \
    "$OPT_BASE/backups/postgres" \
    "$OPT_BASE/elk/es_data" \
    "$OPT_BASE/monitoring/prometheus_data" \
    "$OPT_BASE/monitoring/grafana_data"
  sudo chmod -R 777 "$OPT_BASE/elk/es_data"   # elasticsearch needs open perms
  echo -e "${G}done${X}"
  echo -ne "${B}  │  ${X}/etc/netpong/ .................. "
  sudo mkdir -p "$ETC_BASE"
  echo -e "${G}done${X}"
  BACKUP_COMPOSE_PATH="${BACKUP_HOST_DIR}"
  [ "$BACKUP_HOST_DIR" = "$ROOT/data/backups" ] && BACKUP_COMPOSE_PATH="$OPT_BASE/backups/postgres"
else
  OPT_BASE="$ROOT/data/opt"
  ETC_BASE="$ROOT/data/etc"
  echo -ne "${B}  │  ${X}./data/opt/* ................... "
  mkdir -p \
    "$OPT_BASE/backups/postgres" \
    "$OPT_BASE/elk/es_data" \
    "$OPT_BASE/monitoring/prometheus_data" \
    "$OPT_BASE/monitoring/grafana_data"
  chmod -R 777 "$OPT_BASE/elk/es_data"
  echo -e "${G}done${X}"
  echo -ne "${B}  │  ${X}./data/etc/ .................... "
  mkdir -p "$ETC_BASE"
  echo -e "${G}done${X}"
  BACKUP_COMPOSE_PATH="$BACKUP_HOST_DIR"
  warn "No sudo — using local ./data/ instead of /opt/netpong and /etc/netpong"
  warn "Patch your compose files: replace /opt/netpong → $OPT_BASE"
  warn "                           replace /etc/netpong → $ETC_BASE"
fi

# backup dir (custom or default)
mkdir -p "$BACKUP_HOST_DIR"
ok "Backup dir created: $BACKUP_HOST_DIR"

# nginx certs
mkdir -p "$CERTS_DIR"
ok "nginx/certs/ ready"

# ═══════════════════════════════════════════════════════════════════════
# SECTION 9 — GENERATE SSL CERTIFICATE
# ═══════════════════════════════════════════════════════════════════════
sec "Generating self-signed SSL certificate"
inf "localhost — valid 825 days — placed in nginx/certs/"
line

if [ -f "$CERTS_DIR/nginx.crt" ] && [ -f "$CERTS_DIR/nginx.key" ]; then
  ok "Certificate already exists — skipping generation."
else
  openssl req -x509 -nodes -days 825 \
    -newkey rsa:2048 \
    -keyout "$CERTS_DIR/nginx.key" \
    -out    "$CERTS_DIR/nginx.crt" \
    -subj "/C=MA/ST=Local/L=Local/O=NetPong/OU=Dev/CN=localhost" \
    -extensions v3_req \
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1" \
    2>/dev/null
  ok "nginx.crt + nginx.key generated in nginx/certs/"
fi

# ═══════════════════════════════════════════════════════════════════════
# SECTION 10 — WRITE ENV FILES
# ═══════════════════════════════════════════════════════════════════════
sec "Writing .env files"
line

# ── infra/env/backend.env ─────────────────────────────────────────────
cat > "$ENV_DIR/backend.env" <<EOF
# ── APP ───────────────────────────────────────────────────────────────
NODE_ENV=production

# ── DATABASE ──────────────────────────────────────────────────────────
DB_HOST=database
POSTGRES_DB=ft_transcendence
POSTGRES_USER=postgres
POSTGRES_PASSWORD=$DB_PASS
POSTGRES_PORT=5432

# ── JWT ───────────────────────────────────────────────────────────────
JWT_ACCESS_SECRET=$JWT_ACCESS
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_SECRET=$JWT_REFRESH
JWT_REFRESH_EXPIRES=7d

# ── GOOGLE OAUTH ──────────────────────────────────────────────────────
GOOGLE_CLIENT_ID=$GOOGLE_ID
GOOGLE_CLIENT_SECRET=$GOOGLE_SECRET
GOOGLE_CALL_BACK_URL=https://localhost/api/auth/google/callback

# ── GITHUB OAUTH ──────────────────────────────────────────────────────
GITHUB_CLIENT_ID=$GITHUB_ID
GITHUB_CLIENT_SECRET=$GITHUB_SECRET
GITHUB_CALL_BACK_URL=https://localhost/api/auth/github/callback

# ── 42 INTRA OAUTH ────────────────────────────────────────────────────
INTRA_42_CLIENT_ID=$INTRA_ID
INTRA_42_CLIENT_SECRET=$INTRA_SECRET
INTRA_42_CALL_BACK_URL=https://localhost/api/auth/42/callback

# ── EMAIL (RESEND) ────────────────────────────────────────────────────
RESEND_API_KEY=$RESEND_KEY
RESEND_FROM=NetPong Support <$RESEND_FROM_ADDR>

# ── URLS ──────────────────────────────────────────────────────────────
FRONTEND_URL=https://localhost
CORS_ORIGINS=https://localhost
EOF
echo -ne "${B}  │  ${X}infra/env/backend.env .......... "; ok "written"

# ── infra/env/database.env ────────────────────────────────────────────
cat > "$ENV_DIR/database.env" <<EOF
DB_HOST=database
POSTGRES_DB=ft_transcendence
POSTGRES_USER=postgres
POSTGRES_PASSWORD=$DB_PASS
POSTGRES_PORT=5432
EOF
echo -ne "${B}  │  ${X}infra/env/database.env ......... "; ok "written"

# ── infra/env/backup.env ──────────────────────────────────────────────
cat > "$ENV_DIR/backup.env" <<EOF
DB_HOST=database
POSTGRES_DB=ft_transcendence
POSTGRES_USER=postgres
PGPASSWORD=$DB_PASS
POSTGRES_PORT=5432
BACKUP_DIR=/local-backups
EOF
echo -ne "${B}  │  ${X}infra/env/backup.env ........... "; ok "written"

# ── infra/env/nginx.env ───────────────────────────────────────────────
cat > "$ENV_DIR/nginx.env" <<EOF
DOMAIN=localhost
EOF
echo -ne "${B}  │  ${X}infra/env/nginx.env ............ "; ok "written"

# ── ELK env ($ETC_BASE/elk.env) ───────────────────────────────────────
ELK_ENV_PATH="$ETC_BASE/elk.env"
if [ "$HAS_SUDO" = true ] && [ "$ETC_BASE" = "/etc/netpong" ]; then
  ELK_ENV_TMP=$(mktemp)
  cat > "$ELK_ENV_TMP" <<EOF
# ── Elasticsearch ─────────────────────────────────────────────────────
discovery.type=single-node
xpack.security.enabled=true
ES_JAVA_OPTS=-Xms512m -Xmx512m
ELASTIC_PASSWORD=$ELASTIC_PASS

# ── Kibana ────────────────────────────────────────────────────────────
ELASTICSEARCH_HOSTS=http://elasticsearch:9200
ELASTICSEARCH_USERNAME=kibana_system
ELASTICSEARCH_PASSWORD=$KIBANA_PASS
SERVER_BASEPATH=/kibana
SERVER_REWRITEBASEPATH=true

# ── Logstash ──────────────────────────────────────────────────────────
LOG_LEVEL=error
EOF
  sudo mv "$ELK_ENV_TMP" "$ELK_ENV_PATH"
  sudo chmod 644 "$ELK_ENV_PATH"
else
  cat > "$ELK_ENV_PATH" <<EOF
# ── Elasticsearch ─────────────────────────────────────────────────────
discovery.type=single-node
xpack.security.enabled=true
ES_JAVA_OPTS=-Xms512m -Xmx512m
ELASTIC_PASSWORD=$ELASTIC_PASS

# ── Kibana ────────────────────────────────────────────────────────────
ELASTICSEARCH_HOSTS=http://elasticsearch:9200
ELASTICSEARCH_USERNAME=kibana_system
ELASTICSEARCH_PASSWORD=$KIBANA_PASS
SERVER_BASEPATH=/kibana
SERVER_REWRITEBASEPATH=true

# ── Logstash ──────────────────────────────────────────────────────────
LOG_LEVEL=error
EOF
fi
echo -ne "${B}  │  ${X}${ETC_BASE}/elk.env "; ok "written"

# ── Grafana env ($ETC_BASE/grafana.env) ───────────────────────────────
GRAFANA_ENV_PATH="$ETC_BASE/grafana.env"
GRAFANA_CONTENT="GF_SECURITY_ADMIN_USER=admin
GF_SECURITY_ADMIN_PASSWORD=$GRAFANA_PASS
GF_AUTH_ANONYMOUS_ENABLED=false
GF_SERVER_DOMAIN=localhost
GF_SERVER_ROOT_URL=https://localhost/grafana/
GF_SERVER_SERVE_FROM_SUB_PATH=true"

if [ "$HAS_SUDO" = true ] && [ "$ETC_BASE" = "/etc/netpong" ]; then
  echo "$GRAFANA_CONTENT" | sudo tee "$GRAFANA_ENV_PATH" > /dev/null
  sudo chmod 644 "$GRAFANA_ENV_PATH"
else
  echo "$GRAFANA_CONTENT" > "$GRAFANA_ENV_PATH"
fi
echo -ne "${B}  │  ${X}${ETC_BASE}/grafana.env "; ok "written"

# ── Discord env ($ETC_BASE/discord.env) ───────────────────────────────
DISCORD_ENV_PATH="$ETC_BASE/discord.env"
DISCORD_CONTENT="DISCORD_WEBHOOK_URL=$DISCORD_WEBHOOK"

if [ "$HAS_SUDO" = true ] && [ "$ETC_BASE" = "/etc/netpong" ]; then
  echo "$DISCORD_CONTENT" | sudo tee "$DISCORD_ENV_PATH" > /dev/null
  sudo chmod 644 "$DISCORD_ENV_PATH"
else
  echo "$DISCORD_CONTENT" > "$DISCORD_ENV_PATH"
fi
echo -ne "${B}  │  ${X}${ETC_BASE}/discord.env "; ok "written"

# ═══════════════════════════════════════════════════════════════════════
# SECTION 11 — PATCH COMPOSE IF USING LOCAL PATHS
# ═══════════════════════════════════════════════════════════════════════
if [ "$HAS_SUDO" = false ]; then
  sec "Patching compose files for local paths"
  line

  # patch backup volume in docker-compose.yml
  if [ -f "$COMPOSE_FILE" ]; then
    sed -i "s|/opt/netpong/backups/postgres|$BACKUP_HOST_DIR|g" "$COMPOSE_FILE"
    ok "Patched backup volume in docker-compose.yml"
  fi

  # patch elk compose
  ELK_COMPOSE="$ROOT/infra/compose/docker-compose.elk.yml"
  if [ -f "$ELK_COMPOSE" ]; then
    sed -i \
      "s|/etc/netpong/elk.env|$ETC_BASE/elk.env|g; \
       s|/opt/netpong/elk/es_data|$OPT_BASE/elk/es_data|g" \
      "$ELK_COMPOSE"
    ok "Patched elk compose paths"
  fi

  # patch monitoring compose
  MON_COMPOSE="$ROOT/infra/compose/docker-compose.monitoring.yml"
  if [ -f "$MON_COMPOSE" ]; then
    sed -i \
      "s|/etc/netpong/grafana.env|$ETC_BASE/grafana.env|g; \
       s|/etc/netpong/discord.env|$ETC_BASE/discord.env|g; \
       s|/opt/netpong/monitoring/prometheus_data|$OPT_BASE/monitoring/prometheus_data|g; \
       s|/opt/netpong/monitoring/grafana_data|$OPT_BASE/monitoring/grafana_data|g" \
      "$MON_COMPOSE"
    ok "Patched monitoring compose paths"
  fi
fi

# ═══════════════════════════════════════════════════════════════════════
# SECTION 12 — PATCH BACKUP VOLUME IN COMPOSE
# ═══════════════════════════════════════════════════════════════════════
# Always patch backup dir if user specified custom path
if [ "$BACKUP_HOST_DIR" != "/opt/netpong/backups/postgres" ] && [ -f "$COMPOSE_FILE" ]; then
  sed -i "s|/opt/netpong/backups/postgres|$BACKUP_HOST_DIR|g" "$COMPOSE_FILE" 2>/dev/null || true
fi

# ═══════════════════════════════════════════════════════════════════════
# DONE
# ═══════════════════════════════════════════════════════════════════════
echo ""
echo -e "${G}${BOLD}  ╔══════════════════════════════════════════════════════╗"
echo -e "  ║   ✓  Setup complete! Everything is ready.           ║"
echo -e "  ╚══════════════════════════════════════════════════════╝${X}"
echo ""
echo -e "  ${BOLD}Created:${X}"
echo -e "  ${G}→${X} infra/env/backend.env"
echo -e "  ${G}→${X} infra/env/database.env"
echo -e "  ${G}→${X} infra/env/backup.env"
echo -e "  ${G}→${X} infra/env/nginx.env"
echo -e "  ${G}→${X} ${ETC_BASE}/elk.env"
echo -e "  ${G}→${X} ${ETC_BASE}/grafana.env"
echo -e "  ${G}→${X} ${ETC_BASE}/discord.env"
echo -e "  ${G}→${X} nginx/certs/nginx.crt + nginx.key"
echo -e "  ${G}→${X} init-elk.sh  ${DIM}(run once after docker compose up)${X}"
echo -e "  ${G}→${X} All data directories"
echo ""
echo -e "  ${BOLD}Your generated passwords — save these now:${X}"
echo -e "  ${C}Database :${X}  $DB_PASS"
echo -e "  ${C}Elastic  :${X}  $ELASTIC_PASS"
echo -e "  ${C}Kibana   :${X}  $KIBANA_PASS"
echo -e "  ${C}Grafana  :${X}  $GRAFANA_PASS"
echo ""

# ═══════════════════════════════════════════════════════════════════════
# SECTION 13 — GENERATE init-elk.sh
# ═══════════════════════════════════════════════════════════════════════
# Elasticsearch with xpack.security=true locks all built-in users on first boot.
# kibana_system password MUST be set via API after ES is running — the env file
# alone is not enough. This script does it automatically.

INIT_ELK="$ROOT/init-elk.sh"
cat > "$INIT_ELK" <<ELKSCRIPT
#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════════════╗
# ║  NETPONG — ELK Init Script                                          ║
# ║  Run this ONCE after: docker compose up --build                     ║
# ║  It waits for Elasticsearch then sets the kibana_system password    ║
# ╚══════════════════════════════════════════════════════════════════════╝

set -euo pipefail

R='\033[0;31m'; G='\033[0;32m'; Y='\033[1;33m'; C='\033[0;36m'
BOLD='\033[1m'; DIM='\033[2m'; X='\033[0m'

ELASTIC_PASS="$ELASTIC_PASS"
KIBANA_PASS="$KIBANA_PASS"
ES_URL="http://localhost:9200"

# find elasticsearch container
ES_CONTAINER=\$(docker ps --format '{{.Names}}' | grep -i elasticsearch | head -1)
if [ -z "\$ES_CONTAINER" ]; then
  echo -e "\${R}✗  Elasticsearch container not found. Is docker compose running?\${X}"
  exit 1
fi

echo ""
echo -e "\${C}\${BOLD}  Waiting for Elasticsearch to be ready...\${X}"

# wait up to 120s for ES to be healthy
TRIES=0
until docker exec "\$ES_CONTAINER" curl -sf -u "elastic:\$ELASTIC_PASS" "\$ES_URL/_cluster/health" 2>/dev/null | grep -q '"status"'; do
  TRIES=\$((TRIES+1))
  if [ \$TRIES -ge 60 ]; then
    echo -e "\${R}  ✗  Elasticsearch did not become healthy after 120s. Check logs:\${X}"
    echo -e "     docker logs \$ES_CONTAINER"
    exit 1
  fi
  echo -ne "  \${DIM}waiting... (\${TRIES}/60)\r\${X}"
  sleep 2
done

echo -e "  \${G}✓  Elasticsearch is up\${X}               "

# set kibana_system password
echo -ne "  Setting kibana_system password ... "
HTTP_CODE=\$(docker exec "\$ES_CONTAINER" curl -sf -o /dev/null -w "%{http_code}" \
  -u "elastic:\$ELASTIC_PASS" \
  -X POST "\$ES_URL/_security/user/kibana_system/_password" \
  -H "Content-Type: application/json" \
  -d "{\"password\":\"$KIBANA_PASS\"}")

if [ "\$HTTP_CODE" = "200" ]; then
  echo -e "\${G}done ✓\${X}"
else
  echo -e "\${R}failed (HTTP \$HTTP_CODE)\${X}"
  echo -e "\${Y}  Try running manually inside the container:\${X}"
  echo -e "  docker exec -it \$ES_CONTAINER curl -u elastic:\$ELASTIC_PASS \\"
  echo -e "    -X POST http://localhost:9200/_security/user/kibana_system/_password \\"
  echo -e "    -H 'Content-Type: application/json' \\"
  echo -e "    -d '{\"password\":\"$KIBANA_PASS\"}'"
  exit 1
fi

# verify kibana can reach ES with new password
echo -ne "  Verifying Kibana auth ............. "
VERIFY=\$(docker exec "\$ES_CONTAINER" curl -sf -o /dev/null -w "%{http_code}" \
  -u "kibana_system:\$KIBANA_PASS" \
  "\$ES_URL")

if [ "\$VERIFY" = "200" ]; then
  echo -e "\${G}verified ✓\${X}"
else
  echo -e "\${Y}warning — got HTTP \$VERIFY (may still work, kibana_system has limited access)\${X}"
fi

echo ""
echo -e "\${G}\${BOLD}  ✓  ELK init complete.\${X}"
echo -e "  Kibana should be available at: \${C}https://localhost/kibana\${X}"
echo -e "  Login: \${BOLD}elastic\${X} / \${BOLD}\$ELASTIC_PASS\${X}"
echo ""
ELKSCRIPT

chmod +x "$INIT_ELK"
ok "init-elk.sh generated at project root"

# ── WARNINGS ──────────────────────────────────────────────────────────
echo ""
if grep -q "your_google_client_id" "$ENV_DIR/backend.env" 2>/dev/null; then
  warn "Some OAuth keys were skipped. OAuth login won't work until you fill infra/env/backend.env"
fi
if grep -q "your_resend_api_key" "$ENV_DIR/backend.env" 2>/dev/null; then
  warn "Resend API key skipped. Password reset emails won't work until filled."
fi
if grep -q "placeholder-no-discord" "$ETC_BASE/discord.env" 2>/dev/null; then
  warn "Discord webhook skipped. Alert notifications won't work until filled."
fi

echo ""
echo -e "${G}${BOLD}  ════════════════════════════════════════════════════════${X}"
echo -e "${BOLD}  Next steps:${X}"
echo ""
echo -e "  ${BOLD}1.${X} Start everything:"
echo -e "     ${C}cd infra/compose && docker compose up --build${X}"
echo ""
echo -e "  ${BOLD}2.${X} Once containers are up, init Kibana auth ${DIM}(run once only):${X}"
echo -e "     ${C}./init-elk.sh${X}"
echo ""
echo -e "  ${BOLD}3.${X} Open the app:"
echo -e "     ${C}https://localhost${X}"
echo ""
echo -e "  ${DIM}Kibana  → https://localhost/kibana  (elastic / $ELASTIC_PASS)${X}"
echo -e "  ${DIM}Grafana → https://localhost/grafana (admin / $GRAFANA_PASS)${X}"
echo ""
