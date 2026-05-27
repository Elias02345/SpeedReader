#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════════════════════
#  SpeedReader – System Installer
#  Usage:  sudo bash install.sh
#  Or:     curl -sSL https://raw.githubusercontent.com/elias02345/SpeedReader/main/install.sh | sudo bash
# ════════════════════════════════════════════════════════════════════════════
set -euo pipefail
IFS=$'\n\t'

# ── Settings (override via env) ──────────────────────────────────────────────
REPO="${SPEEDREADER_REPO:-https://github.com/elias02345/SpeedReader.git}"
BRANCH="${SPEEDREADER_BRANCH:-main}"
INSTALL_DIR="${SPEEDREADER_DIR:-/opt/speedreader}"
SERVICE_NAME="speedreader"
SVC_USER="speedreader"
PORT="${SPEEDREADER_PORT:-7070}"
UPDATE_BIN="/usr/local/bin/speedreader-update"

# ── Terminal colors ──────────────────────────────────────────────────────────
if [[ -t 1 ]]; then
  CR='\033[0;31m' CG='\033[0;32m' CY='\033[1;33m'
  CB='\033[0;34m' CC='\033[0;36m' CW='\033[1;37m' CN='\033[0m'
else
  CR='' CG='' CY='' CB='' CC='' CW='' CN=''
fi

_log()   { echo -e "${CG}▶${CN} $*"; }
_info()  { echo -e "  ${CC}$*${CN}"; }
_ok()    { echo -e "${CG}✓${CN} $*"; }
_warn()  { echo -e "${CY}⚠ $*${CN}"; }
_error() { echo -e "${CR}✗ $*${CN}" >&2; exit 1; }
_step()  { echo ""; echo -e "${CW}── $* ──${CN}"; }

# ── Banner ───────────────────────────────────────────────────────────────────
echo -e "${CW}"
echo "  ╔═══════════════════════════════════════╗"
echo "  ║      SpeedReader  Installer           ║"
echo "  ║      RSVP Speed Reading System        ║"
echo "  ╚═══════════════════════════════════════╝"
echo -e "${CN}"

# ── Root guard ───────────────────────────────────────────────────────────────
if [[ $EUID -ne 0 ]]; then
  _warn "Not running as root – re-launching with sudo..."
  exec sudo bash "$0" "$@"
fi

# ── Systemd check ─────────────────────────────────────────────────────────────
if ! command -v systemctl &>/dev/null; then
  _error "systemd is required but not found. Cannot install as a service."
fi
systemctl --version &>/dev/null || _error "systemctl is not functional."

# ── OS / package manager detection ───────────────────────────────────────────
detect_pkgmgr() {
  if   command -v apt-get &>/dev/null; then PKG=apt
  elif command -v dnf     &>/dev/null; then PKG=dnf
  elif command -v yum     &>/dev/null; then PKG=yum
  elif command -v pacman  &>/dev/null; then PKG=pacman
  elif command -v apk     &>/dev/null; then PKG=apk
  elif command -v zypper  &>/dev/null; then PKG=zypper
  else PKG=none
  fi
  _info "Package manager: ${PKG}"
}

install_pkgs() {
  local pkgs=("$@")
  [[ ${#pkgs[@]} -eq 0 ]] && return
  _info "Installing: ${pkgs[*]}"
  case $PKG in
    apt)
      DEBIAN_FRONTEND=noninteractive apt-get install -y -qq "${pkgs[@]}" >/dev/null
      ;;
    dnf|yum)
      $PKG install -y -q "${pkgs[@]}" >/dev/null
      ;;
    pacman)
      pacman -Sy --noconfirm --quiet "${pkgs[@]}" >/dev/null
      ;;
    apk)
      apk add --quiet "${pkgs[@]}" >/dev/null
      ;;
    zypper)
      zypper --quiet install -y "${pkgs[@]}" >/dev/null
      ;;
    none)
      _error "No package manager found. Install git and python3 manually."
      ;;
  esac
}

# ── Node.js install ───────────────────────────────────────────────────────────
install_node() {
  # Check if Node.js >= 18 already present
  if command -v node &>/dev/null; then
    local nv
    nv=$(node --version 2>/dev/null | grep -oE '[0-9]+' | head -1)
    if [[ ${nv:-0} -ge 18 ]]; then
      _ok "Node.js $(node --version) already installed"
      return
    fi
  fi

  _info "Installing Node.js 22.x..."
  case $PKG in
    apt)
      curl -fsSL https://deb.nodesource.com/setup_22.x | bash - >/dev/null
      DEBIAN_FRONTEND=noninteractive apt-get install -y -qq nodejs >/dev/null
      ;;
    dnf)
      dnf module install -y nodejs:22 >/dev/null 2>&1 || dnf install -y nodejs npm >/dev/null
      ;;
    yum)
      curl -fsSL https://rpm.nodesource.com/setup_22.x | bash - >/dev/null
      yum install -y nodejs >/dev/null
      ;;
    pacman)
      pacman -Sy --noconfirm --quiet nodejs npm >/dev/null
      ;;
    apk)
      apk add --quiet nodejs npm >/dev/null
      ;;
    zypper)
      zypper --quiet install -y nodejs22 npm22 >/dev/null 2>&1 \
        || zypper --quiet install -y nodejs npm >/dev/null
      ;;
    none)
      _error "No package manager found. Install Node.js 18+ manually: https://nodejs.org"
      ;;
  esac
  _ok "Node.js $(node --version)  ·  npm $(npm --version)"
}

# ── Dependency check + install ────────────────────────────────────────────────
check_deps() {
  _step "Checking dependencies"
  detect_pkgmgr

  local missing=()
  command -v git  &>/dev/null || missing+=(git)
  command -v curl &>/dev/null || missing+=(curl)

  if [[ ${#missing[@]} -gt 0 ]]; then
    [[ $PKG == apt ]] && { apt-get update -qq >/dev/null; }
    install_pkgs "${missing[@]}"
  fi

  install_node

  local git_v node_v
  git_v=$(git --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+(\.[0-9]+)?' | head -1)
  node_v=$(node --version 2>/dev/null)
  _ok "git ${git_v}  ·  node ${node_v}"
}

# ── Clone / update repository ─────────────────────────────────────────────────
setup_repo() {
  _step "Installing application"

  if [[ -d "$INSTALL_DIR/.git" ]]; then
    _info "Updating existing installation at ${INSTALL_DIR}..."
    git -C "$INSTALL_DIR" remote set-url origin "$REPO" 2>/dev/null || true
    git -C "$INSTALL_DIR" fetch origin --quiet
    git -C "$INSTALL_DIR" checkout "$BRANCH" --quiet 2>/dev/null || \
      git -C "$INSTALL_DIR" checkout -b "$BRANCH" "origin/$BRANCH" --quiet
    git -C "$INSTALL_DIR" pull origin "$BRANCH" --quiet
  else
    _info "Cloning ${REPO} (branch: ${BRANCH})..."
    git clone --branch "$BRANCH" --depth 1 --quiet "$REPO" "$INSTALL_DIR"
  fi

  write_version_json
  _ok "Application at ${INSTALL_DIR}  ($(git -C "$INSTALL_DIR" rev-parse --short HEAD))"
}

# ── npm install + Vite build ───────────────────────────────────────────────────
build_app() {
  _step "Installing npm dependencies & building"
  _info "npm install..."
  npm --prefix "$INSTALL_DIR" install --silent 2>/dev/null \
    || npm --prefix "$INSTALL_DIR" install  # fallback without --silent

  _info "npm run build..."
  npm --prefix "$INSTALL_DIR" run build 2>&1 | tail -5 || _error "Build failed."

  _ok "Build complete → ${INSTALL_DIR}/dist/"
}

write_version_json() {
  local commit date_iso
  commit=$(git -C "$INSTALL_DIR" rev-parse HEAD)
  date_iso=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  cat > "${INSTALL_DIR}/version.json" <<EOF
{
  "commit": "${commit}",
  "branch": "${BRANCH}",
  "repo": "https://github.com/elias02345/SpeedReader",
  "installedAt": "${date_iso}",
  "updatedAt": "${date_iso}"
}
EOF
}

# ── System user ────────────────────────────────────────────────────────────────
setup_user() {
  _step "Creating service user"

  if ! id "$SVC_USER" &>/dev/null; then
    useradd \
      --system \
      --no-create-home \
      --shell /usr/sbin/nologin \
      --comment "SpeedReader service account" \
      "$SVC_USER" 2>/dev/null \
      || useradd --system --no-create-home --shell /bin/false \
                 --comment "SpeedReader service account" "$SVC_USER"
    _ok "User '${SVC_USER}' created"
  else
    _info "User '${SVC_USER}' already exists – skipping"
  fi

  chown -R "${SVC_USER}:${SVC_USER}" "$INSTALL_DIR"
  chmod 755 "$INSTALL_DIR"
  find "$INSTALL_DIR" -type f -name "*.sh" -exec chmod 755 {} \;
  # Vite binary needs execute permission
  chmod +x "${INSTALL_DIR}/node_modules/.bin/vite" 2>/dev/null || true
}

# ── Systemd service ────────────────────────────────────────────────────────────
setup_service() {
  _step "Creating systemd service"

  local node_bin vite_bin
  node_bin=$(command -v node)
  vite_bin="${INSTALL_DIR}/node_modules/.bin/vite"
  [[ -f "$vite_bin" ]] || _error "vite binary not found at ${vite_bin}. Did the build succeed?"

  cat > "/etc/systemd/system/${SERVICE_NAME}.service" <<EOF
[Unit]
Description=SpeedReader – RSVP Speed Reading App (Vite Preview)
Documentation=https://github.com/elias02345/SpeedReader
After=network.target
Wants=network.target

[Service]
Type=simple
User=${SVC_USER}
Group=${SVC_USER}
WorkingDirectory=${INSTALL_DIR}
ExecStart=${node_bin} ${vite_bin} preview --host 127.0.0.1 --port ${PORT}
Restart=on-failure
RestartSec=5s
StartLimitBurst=5
StartLimitIntervalSec=60s

# Sandboxing
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
ProtectHome=true

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=${SERVICE_NAME}
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

  systemctl daemon-reload
  systemctl enable "${SERVICE_NAME}" --quiet
  systemctl restart "${SERVICE_NAME}"

  # Verify service came up
  local i=0
  while ! systemctl is-active --quiet "${SERVICE_NAME}" && (( i < 6 )); do
    sleep 1; (( i++ ))
  done

  if systemctl is-active --quiet "${SERVICE_NAME}"; then
    _ok "Service '${SERVICE_NAME}' running on port ${PORT}"
  else
    _warn "Service may not be running. Check:"
    _info "  journalctl -u ${SERVICE_NAME} -n 30"
    journalctl -u "${SERVICE_NAME}" --no-pager -n 10 2>/dev/null || true
    _error "Service failed to start."
  fi
}

# ── Update binary ─────────────────────────────────────────────────────────────
install_update_script() {
  _step "Installing update command"

  cat > "${INSTALL_DIR}/update.sh" <<'UPDSCRIPT'
#!/usr/bin/env bash
# SpeedReader – Update Script
# Usage:  sudo speedreader-update
#         speedreader-update          (auto-escalates via sudo)
set -euo pipefail

INSTALL_DIR="/opt/speedreader"
SERVICE_NAME="speedreader"

[[ $EUID -eq 0 ]] || exec sudo "$0" "$@"

CG='\033[0;32m' CY='\033[1;33m' CR='\033[0;31m' CC='\033[0;36m' CN='\033[0m'
_log()  { echo -e "${CG}▶${CN} $*"; }
_info() { echo -e "  ${CC}$*${CN}"; }
_ok()   { echo -e "${CG}✓${CN} $*"; }
_warn() { echo -e "${CY}⚠${CN} $*"; }
_err()  { echo -e "${CR}✗${CN} $*" >&2; exit 1; }

[[ -d "${INSTALL_DIR}/.git" ]] || _err "SpeedReader not found at ${INSTALL_DIR}"

# Read current state
BRANCH=$(git -C "$INSTALL_DIR" rev-parse --abbrev-ref HEAD 2>/dev/null \
         || cat "${INSTALL_DIR}/version.json" 2>/dev/null | python3 -c \
            "import sys,json; print(json.load(sys.stdin).get('branch','main'))" \
         || echo "main")

_log "Checking for updates (branch: ${BRANCH})..."

git -C "$INSTALL_DIR" fetch origin --quiet
LOCAL=$(git  -C "$INSTALL_DIR" rev-parse HEAD)
REMOTE=$(git -C "$INSTALL_DIR" rev-parse "origin/${BRANCH}" 2>/dev/null \
         || git -C "$INSTALL_DIR" rev-parse "origin/main")

if [[ "$LOCAL" == "$REMOTE" ]]; then
  _ok "Already up to date  (${LOCAL:0:8})"
  exit 0
fi

COUNT=$(git -C "$INSTALL_DIR" rev-list --count "HEAD..origin/${BRANCH}" 2>/dev/null || echo "?")
_log "Update available: ${COUNT} new commit(s)"
_info "Current : ${LOCAL:0:8}"
_info "Latest  : ${REMOTE:0:8}"

# Show changelog
echo ""
git -C "$INSTALL_DIR" log --oneline "HEAD..origin/${BRANCH}" 2>/dev/null | head -10 || true
echo ""

read -r -p "  Proceed with update? [Y/n] " answer
case "${answer:-Y}" in
  [Yy]*|"") : ;;
  *) _info "Aborted."; exit 0 ;;
esac

# Pull
_log "Pulling changes..."
git -C "$INSTALL_DIR" pull origin "$BRANCH" --quiet
_ok "Code updated to $(git -C "$INSTALL_DIR" rev-parse --short HEAD)"

# Rebuild
_log "Rebuilding application..."
npm --prefix "$INSTALL_DIR" install --silent 2>/dev/null || npm --prefix "$INSTALL_DIR" install
npm --prefix "$INSTALL_DIR" run build
_ok "Build complete"

# Update version.json
COMMIT=$(git -C "$INSTALL_DIR" rev-parse HEAD)
DATE=$(date -u +%Y-%m-%dT%H:%M:%SZ)
python3 - <<PYEOF
import json, os
path = '${INSTALL_DIR}/version.json'
try:
    with open(path) as f:
        v = json.load(f)
except Exception:
    v = {}
v['commit']    = '${COMMIT}'
v['updatedAt'] = '${DATE}'
v['branch']    = '${BRANCH}'
with open(path, 'w') as f:
    json.dump(v, f, indent=2)
print('  version.json updated')
PYEOF
chown speedreader:speedreader "${INSTALL_DIR}/version.json" 2>/dev/null || true

# Restart service
_log "Restarting service..."
systemctl restart "$SERVICE_NAME"

sleep 2
if systemctl is-active --quiet "$SERVICE_NAME"; then
  _ok "Service restarted successfully"
else
  _warn "Service may not have started – check: journalctl -u ${SERVICE_NAME} -n 20"
fi

echo ""
_ok "SpeedReader updated to ${COMMIT:0:8} on $(date '+%Y-%m-%d %H:%M')"
UPDSCRIPT

  chmod +x "${INSTALL_DIR}/update.sh"

  # Symlink to PATH
  ln -sf "${INSTALL_DIR}/update.sh" "$UPDATE_BIN"
  chmod +x "$UPDATE_BIN"
  _ok "Installed: speedreader-update  →  ${UPDATE_BIN}"
}

# ── Uninstall script ──────────────────────────────────────────────────────────
install_uninstall_script() {
  cat > "${INSTALL_DIR}/uninstall.sh" <<UNSCRIPT
#!/usr/bin/env bash
# SpeedReader – Uninstaller
set -euo pipefail

[[ \$EUID -eq 0 ]] || exec sudo "\$0" "\$@"

SERVICE="${SERVICE_NAME}"
INSTALL_DIR="${INSTALL_DIR}"
SVC_USER="${SVC_USER}"
UPDATE_BIN="${UPDATE_BIN}"

echo "This will REMOVE SpeedReader completely."
read -r -p "Are you sure? [y/N] " ans
[[ "\${ans:-N}" =~ ^[Yy] ]] || { echo "Aborted."; exit 0; }

systemctl stop "\$SERVICE"    2>/dev/null || true
systemctl disable "\$SERVICE" 2>/dev/null || true
rm -f "/etc/systemd/system/\${SERVICE}.service"
systemctl daemon-reload       2>/dev/null || true

rm -f "\$UPDATE_BIN"
rm -rf "\$INSTALL_DIR"
userdel "\$SVC_USER"          2>/dev/null || true

echo "✓ SpeedReader removed."
UNSCRIPT
  chmod +x "${INSTALL_DIR}/uninstall.sh"
}

# ── Final summary ──────────────────────────────────────────────────────────────
print_summary() {
  local ip
  ip=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "your-ip")
  local commit
  commit=$(git -C "$INSTALL_DIR" rev-parse --short HEAD 2>/dev/null || echo "unknown")

  echo ""
  echo -e "${CW}══════════════════════════════════════════════════${CN}"
  echo -e "${CG}  ✓  SpeedReader installed successfully!${CN}"
  echo -e "${CW}══════════════════════════════════════════════════${CN}"
  echo ""
  echo -e "  ${CC}Open in browser:${CN}"
  echo -e "    http://localhost:${PORT}"
  echo -e "    http://${ip}:${PORT}"
  echo ""
  echo -e "  ${CC}Service management:${CN}"
  echo -e "    systemctl status  ${SERVICE_NAME}"
  echo -e "    systemctl stop    ${SERVICE_NAME}"
  echo -e "    systemctl start   ${SERVICE_NAME}"
  echo -e "    journalctl -u ${SERVICE_NAME} -f"
  echo ""
  echo -e "  ${CC}Updates:${CN}"
  echo -e "    sudo speedreader-update"
  echo ""
  echo -e "  ${CC}Uninstall:${CN}"
  echo -e "    sudo ${INSTALL_DIR}/uninstall.sh"
  echo ""
  echo -e "  Version: ${commit}  ·  Port: ${PORT}  ·  Dir: ${INSTALL_DIR}"
  echo ""
}

# ── Entrypoint ────────────────────────────────────────────────────────────────
main() {
  check_deps
  setup_repo
  build_app
  setup_user
  setup_service
  install_update_script
  install_uninstall_script
  print_summary
}

main "$@"
