#!/bin/bash

# 아래는 프로젝트 종료용 Bash 스크립트입니다.

# Docker Compose 종료
docker compose down -v
# 백그라운드 spring-boot:run 모두 종료
pkill -f "spring-boot:run"
