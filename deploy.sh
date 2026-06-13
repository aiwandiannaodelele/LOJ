#!/bin/bash
set -e
R='\033[0m' B='\033[1m' G='\033[32m' C='\033[36m' M='\033[35m' RED='\033[31m'
OK="  ${G}✔${R}" DOT="${C}•${R}"
ok()  { echo -e "${OK} $1"; }
info(){ echo -e "${DOT} $1"; }
tit(){ echo -e "\n${B}${M}$1${R}"; }
fail(){ echo -e "${RED}✘ $1${R}"; exit 1; }

echo -e "\n${B}LOJ 一键部署${R}\n"
echo -ne "  使用国内镜像 (gitcode+npmirror)? [Y/n]: "
read -r M; USE_MIRROR=true
[ "${M:-y}" = "n" ] && USE_MIRROR=false
$USE_MIRROR && ok "国内加速" || info "直连 GitHub"

GIT_URL="https://github.com/aiwandiannaodelele/LOJ.git"
$USE_MIRROR && GIT_URL="https://gitcode.com/aiwandiannaodelele/LOJ.git"

DIR="$HOME/loj"
echo -ne "  安装目录 [$DIR]: "; read -r D; DIR="${D:-$DIR}"
ok "$DIR"

echo -e "\n  部署方式: [1] Docker  [2] PM2"
echo -ne "  选择 [1]: "; read -r MODE; MODE="${MODE:-1}"

# ── 克隆 ──
tit "克隆仓库"
if [ -d "$DIR/.git" ]; then
  info "仓库已存在: $DIR"
else
  git clone "$GIT_URL" "$DIR" && ok "克隆完成"
fi
cd "$DIR"

# ═══ Docker ═══
if [ "$MODE" = "1" ]; then
  command -v docker &>/dev/null || fail "请先安装 Docker"
  docker compose version &>/dev/null || fail "需要 Docker Compose"
  ok "Docker 已就绪"

  [ ! -f .env ] && cp .env.docker.example .env && ok ".env 已创建"

  tit "构建 & 启动"
  docker compose --profile pgsql up -d --build && \
    ok "部署完成 → http://localhost:3000/init" || \
    fail "Docker 启动失败，查看日志: docker compose logs"

  echo -ne "  启用自动更新 (cron 每5分钟)? [Y/n]: "; read -r A
  if [ "${A:-y}" != "n" ]; then
    (crontab -l 2>/dev/null | grep -v loj/auto-update; echo "*/5 * * * * cd $DIR && ./auto-update.sh") | crontab -
    ok "自动更新已启用"
  fi

# ═══ PM2 ═══
elif [ "$MODE" = "2" ]; then
  command -v node &>/dev/null || fail "请先安装 Node.js"
  command -v npm &>/dev/null || fail "请先安装 npm"
  ok "Node $(node -v)"

  command -v pm2 &>/dev/null || { npm install -g pm2; ok "PM2 已安装"; }

  if $USE_MIRROR; then npm config set registry https://registry.npmmirror.com; fi

  tit "安装 & 构建"
  npm install && npm run db:push && npm run build
  ok "构建完成"

  $USE_MIRROR && npm config delete registry 2>/dev/null

  tit "启动"
  npm run pm2:start
  ok "PM2 已启动 → http://localhost:3000/init"

  echo -ne "  启用自动更新? [Y/n]: "; read -r A
  if [ "${A:-y}" != "n" ]; then
    cat > /tmp/loj-pm2-update.sh << 'EOF'
#!/bin/bash
cd DIR_PLACEHOLDER
git fetch origin main 2>/dev/null
L=$(git rev-parse main 2>/dev/null)
R=$(git rev-parse origin/main 2>/dev/null)
[ "$L" != "$R" ] && [ -n "$R" ] && { git pull origin main; npm install && npm run build && pm2 restart loj; }
EOF
    sed -i '' "s|DIR_PLACEHOLDER|$DIR|" /tmp/loj-pm2-update.sh 2>/dev/null || sed -i "s|DIR_PLACEHOLDER|$DIR|" /tmp/loj-pm2-update.sh
    chmod +x /tmp/loj-pm2-update.sh
    (crontab -l 2>/dev/null | grep -v loj-pm2-update; echo "*/5 * * * * /tmp/loj-pm2-update.sh") | crontab -
    ok "自动更新已启用"
  fi

fi

echo -e "\n${G}${B}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${R}"
echo -e "${G}${B}  LOJ 部署完成！${R}"
echo -e "${G}${B}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${R}"
echo ""
