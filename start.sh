#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
#  Claude 사용량 대시보드 — Mac / Linux 실행 스크립트
#  사용법: ./start.sh
# ──────────────────────────────────────────────────────────────
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
ENV_FILE="$BACKEND_DIR/.env"

# ── 색상 ──────────────────────────────────────────────────────
RED='\033[0;31m'; YELLOW='\033[1;33m'; GREEN='\033[0;32m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

echo ""
echo -e "${BOLD}${CYAN}  ◆  Claude 사용량 대시보드${NC}"
echo ""

# ── Node.js 확인 ──────────────────────────────────────────────
if ! command -v node &>/dev/null; then
    echo -e "${RED}  ✗  Node.js가 설치되어 있지 않습니다.${NC}"
    echo "     https://nodejs.org 에서 설치 후 다시 실행하세요."
    exit 1
fi

NODE_VER=$(node -e "process.stdout.write(process.version)")
echo -e "  ✓  Node.js ${NODE_VER}"

# ── npm 패키지 설치 ───────────────────────────────────────────
if [ ! -d "$BACKEND_DIR/node_modules" ]; then
    echo -e "  →  패키지 설치 중..."
    (cd "$BACKEND_DIR" && npm install --silent)
    echo -e "  ✓  패키지 설치 완료"
fi

# ── API 키 확인 / 설정 ────────────────────────────────────────
if [ ! -f "$ENV_FILE" ]; then
    echo ""
    echo -e "  ${YELLOW}⚠  Anthropic API 키가 필요합니다.${NC}"
    echo "     https://console.anthropic.com 에서 발급받을 수 있습니다."
    echo ""
    printf "  API 키를 입력하세요 (엔터로 건너뛰기): "
    read -r API_KEY
    echo ""
    if [ -n "$API_KEY" ]; then
        echo "ANTHROPIC_API_KEY=$API_KEY" > "$ENV_FILE"
        echo "PORT=3000" >> "$ENV_FILE"
        echo -e "  ✓  API 키 저장 완료 (backend/.env)"
    else
        echo -e "  ${YELLOW}→  API 키 없이 실행합니다. (Claude 테스트 기능 비활성화)${NC}"
        echo "PORT=3000" > "$ENV_FILE"
    fi
fi

# ── 포트 확인 ─────────────────────────────────────────────────
PORT=3000
if lsof -i ":$PORT" &>/dev/null 2>&1; then
    echo -e "  ${YELLOW}⚠  포트 $PORT 가 이미 사용 중입니다. 기존 서버를 재시작합니다.${NC}"
    lsof -ti ":$PORT" | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# ── 서버 실행 ─────────────────────────────────────────────────
echo ""
echo -e "  ${GREEN}→  서버 시작 중...${NC}"
echo -e "  ${CYAN}   Ctrl+C 로 종료${NC}"
echo ""

cd "$BACKEND_DIR"
exec node server.js
