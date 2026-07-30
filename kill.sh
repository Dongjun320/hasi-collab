#!/bin/bash

# 아래는 프로젝트 종료용 Bash 스크립트입니다.

# Docker Compose 종료
# 데이터는 ./.data/ 에 bind mount로 남으므로 -v 를 써도 지워지지 않습니다.
docker compose down -v
# 백그라운드 spring-boot:run 모두 종료
pkill -f "spring-boot:run"

# 볼륨 선언이 없던 시절에 생긴 anonymous volume을 정리합니다.
docker volume prune -f --filter label=com.docker.volume.anonymous
