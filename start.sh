#!/bin/bash

# 아래는 프로젝트 초기 세팅용 Bash 스크립트입니다.
# Git Bash로 돌리거나 IDE 기본 터미널이 Bash로 되어있는지 확인 바라요

# Bash PATH variable 설정
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Docker Compose 실행
docker compose up -d
# Root의 .package.json
npm install
# /client의 .package.json
cd "$ROOT_DIR/client" && npm install
# /service의 maven 컴파일
cd "$ROOT_DIR/service" && ./mvnw clean compile
# /messenger의 maven 컴파일
cd "$ROOT_DIR/messenger" && ./mvnw clean compile
