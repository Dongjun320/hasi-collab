#!/bin/bash
# 테스트 데이터 주입 스크립트
# 사용법: bash seed.sh
# (사전조건: docker compose up -d 로 hasi-postgres 컨테이너가 떠 있어야 함)
# PowerShell에서 Git Bash 호출
# & "C:\Program Files\Git\bin\bash.exe" seed.sh

docker exec -i hasi-postgres psql -U hasi -d collaboration_db < seed_test_data.sql \
  && echo "" \
  && echo "✅ 테스트 데이터 주입 완료" \
  && echo "   계정: 1@1.com ~ 3@3.com" \
  && echo "   비번: 12345678 (전부 동일)" \
  && echo "   u1 = OWNER / u2 = ADMIN(부서장) / u3 = MEMBER" \
  && echo "   보드: design_board(부서장 u2, 부서원 u2·u3) / backend_board(부서장 u1)" \
  && echo "   친구: u1 -> u2,u3" \
  || echo "❌ 실패 — docker 가 켜져 있는지(docker compose up -d) 확인하세요"
