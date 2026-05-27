#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════════════════════
#  SpeedReader – System Installer  (hardened, self-healing)
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
HOST="${SPEEDREADER_HOST:-127.0.0.1}"
UPDATE_BIN="/usr/local/bin/speedreader-update"
NODE_MIN_VERSION=18

# ── Terminal colors ──────────────────────────────────────────────────────────
if [[ -t 1 ]]; then
  CR='\033[0;31m' CG='\033[0;32m' CY='\033[1;33m'
  CC='\033[0;36m' CW='\033[1;37m' CN='\033[0m'
else
  CR='' CG='' CY='' CC='' CW='' CN=''
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

# ── Systemd check ────────────────────────────────────────────────────────────
if ! command -v systemctl &>/dev/null || ! systemctl --version &>/dev/null; then
  _error "systemd is required but not found or not functional."
fi

# ── Package manager detection ────────────────────────────────────────────────
PKG=none
detect_pkgmgr() {
  if   command -v apt-get &>/dev/null; then PKG=apt
  elif command -v dnf     &>/dev/null; then PKG=dnf
  elif command -v yum     &>/dev/null; then PKG=yum
  elif command -v pacman  &>/dev/null; then PKG=pacman
  elif command -v apk     &>/dev/null; then PKG=apk
  elif command -v zypper  &>/dev/null; then PKG=zypper
  fi
  _info "Package manager: ${PKG}"
}

install_pkgs() {
  local pkgs=("$@")
  [[ ${#pkgs[@]} -eq 0 ]] && return 0
  _info "Installing packages: ${pkgs[*]}"
  case $PKG in
    apt)    DEBIAN_FRONTEND=noninteractive apt-get install -y -qq "${pkgs[@]}" >/dev/null ;;
    dnf|yum) $PKG install -y -q "${pkgs[@]}" >/dev/null ;;
    pacman) pacman -Sy --noconfirm --quiet "${pkgs[@]}" >/dev/null ;;
    apk)    apk add --quiet "${pkgs[@]}" >/dev/null ;;
    zypper) zypper --quiet install -y "${pkgs[@]}" >/dev/null ;;
    none)   _warn "No package manager found – install git and curl manually if missing." ;;
  esac
}

# ── Node.js install ───────────────────────────────────────────────────────────
NODE_BIN=""

node_version_ok() {
  local bin="${1:-node}"
  local v
  v=$("$bin" --version 2>/dev/null | grep -oE '[0-9]+' | head -1) || return 1
  [[ ${v:-0} -ge $NODE_MIN_VERSION ]]
}

find_node() {
  # Search common paths in addition to PATH
  for candidate in \
    "$(command -v node 2>/dev/null || true)" \
    /usr/local/bin/node /usr/bin/node \
    /root/.nvm/versions/node/*/bin/node \
    /nvm/versions/node/*/bin/node
  do
    [[ -z "$candidate" || ! -x "$candidate" ]] && continue
    if node_version_ok "$candidate"; then
      NODE_BIN="$candidate"
      return 0
    fi
  done
  return 1
}

install_node_apt() {
  _info "Trying NodeSource (apt)..."
  # Prefer official NodeSource script; fall back to distro package
  if curl -fsSL https://deb.nodesource.com/setup_22.x \
       | bash - >/dev/null 2>&1; then
    DEBIAN_FRONTEND=noninteractive apt-get install -y -qq nodejs >/dev/null && return 0
  fi
  _warn "NodeSource failed – trying distro nodejs package..."
  apt-get update -qq >/dev/null 2>&1 || true
  DEBIAN_FRONTEND=noninteractive apt-get install -y -qq nodejs npm >/dev/null && return 0
  return 1
}

install_node_rpm() {
  local mgr="$1"
  _info "Trying NodeSource (rpm/${mgr})..."
  if curl -fsSL https://rpm.nodesource.com/setup_22.x \
       | bash - >/dev/null 2>&1; then
    $mgr install -y -q nodejs >/dev/null && return 0
  fi
  _warn "NodeSource failed – trying distro nodejs package..."
  $mgr install -y -q nodejs npm >/dev/null 2>&1 && return 0
  return 1
}

install_node_nvm() {
  _info "Trying nvm (fallback)..."
  export NVM_DIR="/root/.nvm"
  if curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh \
       | bash >/dev/null 2>&1; then
    # shellcheck disable=SC1091
    [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
    nvm install 22 >/dev/null 2>&1 && nvm use 22 >/dev/null 2>&1 && return 0
  fi
  return 1
}

ensure_node() {
  # Already acceptable?
  if find_node; then
    _ok "Node.js ${NODE_BIN} ($(${NODE_BIN} --version)) – already OK"
    return 0
  fi

  _info "Node.js >= ${NODE_MIN_VERSION} not found – installing..."
  local ok=false
  case $PKG in
    apt)
      install_node_apt && ok=true || true
      ;;
    dnf)
      { dnf module install -y nodejs:22 >/dev/null 2>&1 || install_node_rpm dnf; } && ok=true || true
      ;;
    yum)
      install_node_rpm yum && ok=true || true
      ;;
    pacman)
      pacman -Sy --noconfirm --quiet nodejs npm >/dev/null 2>&1 && ok=true || true
      ;;
    apk)
      apk add --quiet nodejs npm >/dev/null 2>&1 && ok=true || true
      ;;
    zypper)
      { zypper --quiet install -y nodejs22 npm22 >/dev/null 2>&1 \
        || zypper --quiet install -y nodejs npm >/dev/null 2>&1; } && ok=true || true
      ;;
  esac

  # Last resort: nvm
  if ! $ok || ! find_node; then
    install_node_nvm && find_node && ok=true || true
  fi

  if find_node; then
    _ok "Node.js installed: ${NODE_BIN} ($(${NODE_BIN} --version))"
  else
    _error "Could not install Node.js >= ${NODE_MIN_VERSION}. Install manually: https://nodejs.org"
  fi
}

# ── npm helper (always use found node's npm) ──────────────────────────────────
NPM_BIN=""
find_npm() {
  # npm lives next to node
  local node_dir
  node_dir="$(dirname "$NODE_BIN")"
  if [[ -x "${node_dir}/npm" ]]; then NPM_BIN="${node_dir}/npm"; return 0; fi
  if command -v npm &>/dev/null; then NPM_BIN="$(command -v npm)"; return 0; fi
  return 1
}

# ── Dependency check ──────────────────────────────────────────────────────────
check_deps() {
  _step "Checking dependencies"
  detect_pkgmgr

  local missing=()
  command -v git  &>/dev/null || missing+=(git)
  command -v curl &>/dev/null || missing+=(curl)
  if [[ ${#missing[@]} -gt 0 ]]; then
    [[ $PKG == apt ]] && apt-get update -qq >/dev/null 2>&1 || true
    install_pkgs "${missing[@]}"
  fi

  ensure_node
  find_npm || _error "npm not found alongside node. Try re-installing Node.js."

  local git_v node_v npm_v
  git_v=$(git --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+' | head -1)
  node_v=$("$NODE_BIN" --version 2>/dev/null)
  npm_v=$("$NPM_BIN" --version 2>/dev/null)
  _ok "git ${git_v}  ·  node ${node_v}  ·  npm ${npm_v}"
}

# ── Clone / update repository ─────────────────────────────────────────────────
setup_repo() {
  _step "Installing application"

  if [[ -d "$INSTALL_DIR/.git" ]]; then
    _info "Updating existing installation at ${INSTALL_DIR}..."
    git -C "$INSTALL_DIR" remote set-url origin "$REPO" 2>/dev/null || true
    git -C "$INSTALL_DIR" fetch origin --quiet 2>&1 || {
      _warn "git fetch failed – retrying..."
      sleep 3
      git -C "$INSTALL_DIR" fetch origin --quiet
    }
    git -C "$INSTALL_DIR" checkout "$BRANCH" --quiet 2>/dev/null \
      || git -C "$INSTALL_DIR" checkout -b "$BRANCH" "origin/$BRANCH" --quiet
    git -C "$INSTALL_DIR" reset --hard "origin/$BRANCH" --quiet
  else
    _info "Cloning ${REPO} (branch: ${BRANCH})..."
    rm -rf "$INSTALL_DIR"
    git clone --branch "$BRANCH" --depth 1 --quiet "$REPO" "$INSTALL_DIR" 2>&1 || {
      _warn "Clone failed – retrying in 5s..."
      sleep 5
      git clone --branch "$BRANCH" --depth 1 --quiet "$REPO" "$INSTALL_DIR"
    }
  fi

  _ok "Repository at ${INSTALL_DIR}  ($(git -C "$INSTALL_DIR" rev-parse --short HEAD))"
}

# ── npm install + Vite build ──────────────────────────────────────────────────
build_app() {
  _step "Installing npm dependencies & building"
  cd "$INSTALL_DIR"

  # npm install with retry + cache-clear fallback
  local npm_ok=false
  for attempt in 1 2 3; do
    _info "npm install (attempt ${attempt}/3)..."
    if "$NPM_BIN" install --prefer-offline 2>&1 | tail -3; then
      npm_ok=true; break
    fi
    _warn "npm install attempt ${attempt} failed"
    "$NPM_BIN" cache clean --force 2>/dev/null || true
    rm -rf node_modules package-lock.json
    sleep $(( attempt * 3 ))
  done
  $npm_ok || _error "npm install failed after 3 attempts. Check network connectivity."
  _ok "npm dependencies installed"

  # Vite build with retry
  local build_ok=false
  for attempt in 1 2; do
    _info "npm run build (attempt ${attempt}/2)..."
    if "$NPM_BIN" run build 2>&1; then
      build_ok=true; break
    fi
    _warn "Build attempt ${attempt} failed – cleaning and retrying..."
    rm -rf dist
    sleep 3
  done
  $build_ok || _error "Vite build failed. Run manually: cd ${INSTALL_DIR} && npm run build"
  _ok "Build complete → ${INSTALL_DIR}/dist/"

  # Copy version.json into dist/ so the in-app update checker can find it
  write_version_json
  cp "${INSTALL_DIR}/version.json" "${INSTALL_DIR}/dist/version.json" 2>/dev/null || true
}

write_version_json() {
  local commit date_iso
  commit=$(git -C "$INSTALL_DIR" rev-parse HEAD 2>/dev/null || echo "unknown")
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

# ── System user ───────────────────────────────────────────────────────────────
setup_user() {
  _step "Creating service user"

  if ! id "$SVC_USER" &>/dev/null; then
    useradd --system --no-create-home \
      --shell /usr/sbin/nologin \
      --comment "SpeedReader service" \
      "$SVC_USER" 2>/dev/null \
    || useradd --system --no-create-home --shell /bin/false \
               --comment "SpeedReader service" "$SVC_USER"
    _ok "User '${SVC_USER}' created"
  else
    _info "User '${SVC_USER}' already exists – skipping"
  fi

  chown -R "${SVC_USER}:${SVC_USER}" "$INSTALL_DIR"
  chmod 755 "$INSTALL_DIR"
  # Ensure executable bits on scripts and node binaries
  find "$INSTALL_DIR" -type f -name "*.sh" -exec chmod 755 {} \;
  chmod +x "${INSTALL_DIR}/node_modules/.bin/vite" 2>/dev/null || true
}

# ── Systemd service ───────────────────────────────────────────────────────────
setup_service() {
  _step "Creating systemd service"

  local vite_bin="${INSTALL_DIR}/node_modules/.bin/vite"
  [[ -f "$vite_bin" ]] || _error "Vite binary not found at ${vite_bin}. Build may have failed."

  # Determine full PATH for the service (include node's directory)
  local node_dir
  node_dir="$(dirname "$NODE_BIN")"
  local svc_path="${node_dir}:/usr/local/bin:/usr/bin:/bin"

  # Stop old service if running
  systemctl stop "${SERVICE_NAME}" 2>/dev/null || true

  cat > "/etc/systemd/system/${SERVICE_NAME}.service" <<EOF
[Unit]
Description=SpeedReader – RSVP Speed Reading App
Documentation=https://github.com/elias02345/SpeedReader
After=network.target
Wants=network.target

[Service]
Type=simple
User=${SVC_USER}
Group=${SVC_USER}
WorkingDirectory=${INSTALL_DIR}
ExecStart=${NODE_BIN} ${vite_bin} preview --host ${HOST} --port ${PORT}
Restart=on-failure
RestartSec=5s
StartLimitBurst=5
StartLimitIntervalSec=60s

# Environment
Environment=NODE_ENV=production
Environment=PATH=${svc_path}

# Sandboxing
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
ProtectHome=true

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=${SERVICE_NAME}

[Install]
WantedBy=multi-user.target
EOF

  systemctl daemon-reload
  systemctl enable "${SERVICE_NAME}" --quiet

  _info "Starting service..."
  systemctl start "${SERVICE_NAME}" || {
    _warn "First start failed – waiting 3s and retrying..."
    sleep 3
    systemctl start "${SERVICE_NAME}" || {
      journalctl -u "${SERVICE_NAME}" --no-pager -n 20 2>/dev/null || true
      _error "Service failed to start. See logs above."
    }
  }

  # Wait for it to settle
  local i=0
  while ! systemctl is-active --quiet "${SERVICE_NAME}" && (( i < 8 )); do
    sleep 1; (( i++ ))
  done

  if systemctl is-active --quiet "${SERVICE_NAME}"; then
    _ok "Service '${SERVICE_NAME}' running  (${HOST}:${PORT})"
  else
    journalctl -u "${SERVICE_NAME}" --no-pager -n 20 2>/dev/null || true
    _error "Service failed to stay running. Logs above."
  fi
}

# ── Update script ─────────────────────────────────────────────────────────────
install_update_script() {
  _step "Installing update command"

  local node_dir
  node_dir="$(dirname "$NODE_BIN")"

  cat > "${INSTALL_DIR}/update.sh" <<UPDSCRIPT
#!/usr/bin/env bash
# SpeedReader – Update Script
set -euo pipefail

INSTALL_DIR="${INSTALL_DIR}"
SERVICE_NAME="${SERVICE_NAME}"
BRANCH="${BRANCH}"

[[ \$EUID -eq 0 ]] || exec sudo "\$0" "\$@"

# Bring node/npm into PATH
export PATH="${node_dir}:/usr/local/bin:/usr/bin:/bin:\$PATH"

CG='\033[0;32m' CY='\033[1;33m' CR='\033[0;31m' CC='\033[0;36m' CN='\033[0m'
_log()  { echo -e "\${CG}▶\${CN} \$*"; }
_info() { echo -e "  \${CC}\$*\${CN}"; }
_ok()   { echo -e "\${CG}✓\${CN} \$*"; }
_warn() { echo -e "\${CY}⚠\${CN} \$*"; }
_err()  { echo -e "\${CR}✗\${CN} \$*" >&2; exit 1; }

[[ -d "\${INSTALL_DIR}/.git" ]] || _err "SpeedReader not found at \${INSTALL_DIR}"

_log "Checking for updates (branch: \${BRANCH})..."
git -C "\$INSTALL_DIR" fetch origin --quiet 2>&1 || {
  _warn "git fetch failed – retrying..."
  sleep 3
  git -C "\$INSTALL_DIR" fetch origin --quiet
}

LOCAL=\$(git  -C "\$INSTALL_DIR" rev-parse HEAD)
REMOTE=\$(git -C "\$INSTALL_DIR" rev-parse "origin/\${BRANCH}" 2>/dev/null \
         || git -C "\$INSTALL_DIR" rev-parse "origin/main")

if [[ "\$LOCAL" == "\$REMOTE" ]]; then
  _ok "Already up to date  (\${LOCAL:0:8})"
  exit 0
fi

COUNT=\$(git -C "\$INSTALL_DIR" rev-list --count "HEAD..origin/\${BRANCH}" 2>/dev/null || echo "?")
_log "Update available: \${COUNT} new commit(s)"
_info "Current : \${LOCAL:0:8}"
_info "Latest  : \${REMOTE:0:8}"
echo ""
git -C "\$INSTALL_DIR" log --oneline "HEAD..origin/\${BRANCH}" 2>/dev/null | head -10 || true
echo ""

read -r -p "  Proceed with update? [Y/n] " answer
case "\${answer:-Y}" in
  [Yy]*|"") : ;;
  *) _info "Aborted."; exit 0 ;;
esac

# Pull
_log "Pulling changes..."
git -C "\$INSTALL_DIR" reset --hard "origin/\${BRANCH}" --quiet
_ok "Code updated to \$(git -C "\$INSTALL_DIR" rev-parse --short HEAD)"

# Rebuild with retry
_log "Rebuilding..."
cd "\$INSTALL_DIR"
for attempt in 1 2 3; do
  if npm install --prefer-offline 2>&1 | tail -3 && npm run build 2>&1; then
    break
  fi
  _warn "Build attempt \${attempt} failed – retrying..."
  npm cache clean --force 2>/dev/null || true
  rm -rf node_modules dist
  sleep \$(( attempt * 3 ))
  if [[ \$attempt -eq 3 ]]; then _err "Build failed after 3 attempts."; fi
done
_ok "Build complete"

# Write version.json
COMMIT=\$(git -C "\$INSTALL_DIR" rev-parse HEAD)
DATE=\$(date -u +%Y-%m-%dT%H:%M:%SZ)
cat > "\${INSTALL_DIR}/version.json" <<VJSON
{
  "commit": "\${COMMIT}",
  "branch": "\${BRANCH}",
  "repo": "https://github.com/elias02345/SpeedReader",
  "updatedAt": "\${DATE}"
}
VJSON
cp "\${INSTALL_DIR}/version.json" "\${INSTALL_DIR}/dist/version.json" 2>/dev/null || true
chown speedreader:speedreader "\${INSTALL_DIR}/version.json" \
  "\${INSTALL_DIR}/dist/version.json" 2>/dev/null || true
_ok "version.json updated"

# Restart service
_log "Restarting service..."
systemctl restart "\$SERVICE_NAME"
sleep 2
if systemctl is-active --quiet "\$SERVICE_NAME"; then
  _ok "Service restarted successfully"
else
  _warn "Service may not have started – check: journalctl -u \${SERVICE_NAME} -n 20"
fi

echo ""
_ok "SpeedReader updated to \${COMMIT:0:8} on \$(date '+%Y-%m-%d %H:%M')"
UPDSCRIPT

  chmod +x "${INSTALL_DIR}/update.sh"
  ln -sf "${INSTALL_DIR}/update.sh" "$UPDATE_BIN"
  chmod +x "$UPDATE_BIN"
  _ok "speedreader-update → ${UPDATE_BIN}"
}

# ── Uninstall script ──────────────────────────────────────────────────────────
install_uninstall_script() {
  cat > "${INSTALL_DIR}/uninstall.sh" <<UNSCRIPT
#!/usr/bin/env bash
set -euo pipefail
[[ \$EUID -eq 0 ]] || exec sudo "\$0" "\$@"

echo "This will REMOVE SpeedReader completely."
read -r -p "Are you sure? [y/N] " ans
[[ "\${ans:-N}" =~ ^[Yy] ]] || { echo "Aborted."; exit 0; }

systemctl stop    "${SERVICE_NAME}" 2>/dev/null || true
systemctl disable "${SERVICE_NAME}" 2>/dev/null || true
rm -f "/etc/systemd/system/${SERVICE_NAME}.service"
systemctl daemon-reload 2>/dev/null || true
rm -f "${UPDATE_BIN}"
rm -rf "${INSTALL_DIR}"
userdel "${SVC_USER}" 2>/dev/null || true

echo "✓ SpeedReader removed."
UNSCRIPT
  chmod +x "${INSTALL_DIR}/uninstall.sh"
}

# ── Summary ───────────────────────────────────────────────────────────────────
print_summary() {
  local ip commit
  ip=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "your-ip")
  commit=$(git -C "$INSTALL_DIR" rev-parse --short HEAD 2>/dev/null || echo "unknown")

  echo ""
  echo -e "${CW}══════════════════════════════════════════════════${CN}"
  echo -e "${CG}  ✓  SpeedReader installed successfully!${CN}"
  echo -e "${CW}══════════════════════════════════════════════════${CN}"
  echo ""
  if [[ "$HOST" == "127.0.0.1" ]]; then
    echo -e "  ${CC}Access (reverse-proxy required for external):${CN}"
    echo -e "    http://localhost:${PORT}"
  else
    echo -e "  ${CC}Open in browser:${CN}"
    echo -e "    http://localhost:${PORT}"
    echo -e "    http://${ip}:${PORT}"
  fi
  echo ""
  echo -e "  ${CC}Service management:${CN}"
  echo -e "    systemctl status  ${SERVICE_NAME}"
  echo -e "    systemctl restart ${SERVICE_NAME}"
  echo -e "    journalctl -u ${SERVICE_NAME} -f"
  echo ""
  echo -e "  ${CC}Update:${CN}   sudo speedreader-update"
  echo -e "  ${CC}Uninstall:${CN} sudo ${INSTALL_DIR}/uninstall.sh"
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
