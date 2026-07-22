# Hasi Collab Platform

[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/Dongjun320/hasi-collab/blob/main/docs/readme/README.en.md)
[![日本語](https://img.shields.io/badge/lang-日本語-green.svg)](https://github.com/Dongjun320/hasi-collab/blob/main/README.md)
[![한국어](https://img.shields.io/badge/lang-한국어-yellow.svg)](https://github.com/Dongjun320/hasi-collab/blob/main/docs/readme/README.ko.md)

- [Hasi Collab Platform](#hasi-collab-platform)
  - [개요](#개요)
    - [이런 팀을 위해 만들었습니다](#이런-팀을-위해-만들었습니다)
  - [주요 기능](#주요-기능)
    - [계정 · 인증](#계정--인증)
    - [워크스페이스](#워크스페이스)
    - [멤버 · 초대](#멤버--초대)
    - [채널 채팅](#채널-채팅)
    - [다이렉트 메시지](#다이렉트-메시지)
    - [알림 · 친구](#알림--친구)
    - [메일 연동](#메일-연동)
  - [기술 스택](#기술-스택)
  - [시스템 구조](#시스템-구조)
    - [서비스 구성](#서비스-구성)
    - [데이터 흐름](#데이터-흐름)
    - [폴더 구조](#폴더-구조)
  - [시작하기](#시작하기)
    - [사전 준비](#사전-준비)
    - [실행](#실행)
    - [테스트 계정](#테스트-계정)
  - [개발 가이드](#개발-가이드)
    - [API 명세 관리](#api-명세-관리)
    - [상태 관리 규칙](#상태-관리-규칙)
    - [환경 변수](#환경-변수)
  - [진행 현황](#진행-현황)
  - [팀](#팀)

## 개요

Hasi Collab은 **팀을 하나로 모으는 플랫폼**입니다.

메신저는 메신저대로, 할 일은 다른 도구에 흩어져 있는 상황을 해결하기 위해 만들었습니다. 워크스페이스 하나에서 대화하고, 그 대화가 곧바로 업무 카드가 되고, 팀 전체가 같은 맥락을 공유하는 것을 목표로 합니다.

### 이런 팀을 위해 만들었습니다

- 여러 도구를 오가며 **맥락이 끊기는** 팀
- 대화는 많지만 **누가 무엇을 하는지 흐려지는** 팀

---

## 주요 기능

### 계정 · 인증

이메일 인증을 거쳐 계정을 만들고, 발급받은 토큰으로 로그인 상태를 유지합니다.

| 기능 | 사용자 관점 설명 |
| --- | --- |
| 회원가입 | 이메일 입력 → 인증코드 수신 → 코드 확인 → 닉네임 · 비밀번호 설정 |
| 이메일 인증 | 6자리 코드가 메일로 발송되며 10분간 유효합니다 |
| 로그인 | 로그인 후 발급된 토큰으로 다음 접속 시 자동 로그인됩니다 |
| 소셜 로그인 | Google · LINE · Amazon · X 계정으로 간편하게 시작할 수 있습니다 |
| 비밀번호 재설정 | 가입한 이메일로 인증코드를 받아 새 비밀번호로 변경합니다 |
| 로그아웃 | 서버의 인증 정보를 만료시키고 로컬 상태를 초기화합니다 |

### 워크스페이스

팀 단위의 작업 공간입니다. 사용자는 **자신이 속한 워크스페이스만** 볼 수 있습니다.

- 워크스페이스를 만들면 생성자가 자동으로 소유자(OWNER)가 됩니다
- 홈 화면에서 참여 중인 워크스페이스를 한눈에 확인하고 전환합니다
- 각 워크스페이스는 독립된 채널 · 멤버 · 보드를 가집니다

### 멤버 · 초대

- **멤버 목록** — 참여자와 각자의 역할(소유자 / 관리자 / 멤버), 접속 상태를 확인합니다
- **초대** — 닉네임으로 팀원을 초대하며, 초대받은 사람은 수락 · 거절할 수 있습니다
- **권한 관리** — 소유자 · 관리자는 멤버 역할을 변경하거나 내보낼 수 있습니다

### 채널 채팅

주제별 채널에서 팀이 실시간으로 대화합니다.

- 채널에 들어가면 **이전 대화가 자동으로 불러와집니다**
- 메시지는 실시간으로 도착하며 새로고침이 필요 없습니다
- 보낸 메시지를 **수정 · 삭제**할 수 있고, 삭제된 메시지는 자리만 남습니다

### 다이렉트 메시지

특정 팀원과 1:1로 대화합니다. 상대를 선택하면 둘만의 공간이 열리며, 채널과 동일하게 실시간 송수신 · 수정 · 삭제를 지원합니다.

### 알림 · 친구

- **알림** — 새 메시지 · 멘션 · 초대 · 시스템 공지를 한곳에서 확인하고, 읽음 처리할 수 있습니다
- **친구** — 자주 소통하는 팀원을 친구로 등록해 접속 상태와 안 읽은 메시지를 빠르게 확인합니다

### 메일 연동

외부 메일 계정(Gmail 등)을 연결해 앱을 벗어나지 않고 메일을 확인합니다.

---

## 기술 스택

| 영역 | 기술 |
| --- | --- |
| 프론트엔드 | React 18, TypeScript, Vite, Tailwind CSS v4, Zustand, React Router |
| 백엔드 | Spring Boot 4, Spring Security, Spring Data JPA |
| 실시간 통신 | WebSocket, STOMP, RabbitMQ |
| 데이터베이스 | PostgreSQL 15, Redis 7 |
| API 관리 | OpenAPI 3, openapi-typescript, openapi-generator |
| 인프라 | Docker Compose |
| 국제화 | i18next (한국어 / 일본어) |

---

## 시스템 구조

### 서비스 구성

세 개의 애플리케이션과 세 개의 인프라 컨테이너로 구성됩니다.

| 구성 요소 | 포트 | 역할 |
| --- | --- | --- |
| `app/client` | 5173 | 웹 프론트엔드 (Vite Dev Server) |
| `app/service` | 8080 | 인증 · 워크스페이스 · 멤버 · 보드 REST API |
| `app/messenger` | 8081 | 채팅 · DM 실시간 처리 (STOMP) |
| PostgreSQL | 8200 | 사용자 · 워크스페이스 · 메시지 영속 저장 |
| Redis | 8201 | 인증코드 · 리프레시 토큰 · 세션 캐시 |
| RabbitMQ | 8202 / 8203 / 8204 | STOMP 메시지 브로커 (AMQP / 관리 UI / STOMP) |

> REST API와 실시간 메시징을 **별도 애플리케이션으로 분리**해, 채팅 트래픽이 일반 API 응답에 영향을 주지 않도록 설계했습니다.

### 데이터 흐름

프론트엔드는 단방향 흐름을 따릅니다.

```
network  →  hook  →  store  →  component
(통신)      (조율)    (상태)     (화면)
```

| 계층 | 역할 | 예시 |
| --- | --- | --- |
| network | 서버와 주고받기만 담당 | `api/client.ts`, `api/stomp.ts`, `api/messenger.ts` |
| hook | 통신 결과를 상태에 반영, 구독 · 해제 관리 | `useChannelMessage` |
| store | 전역 상태 보관 | `authStore`, `channelStore`, `workspaceStore` |
| component | 상태를 구독해 화면 렌더링 | `ChannelsPage`, `WorkspaceHome` |

- 화면은 **store만 바라봅니다.** 데이터가 실시간(STOMP)에서 왔든 히스토리(REST)에서 왔든 구분하지 않습니다
- 메시지 전송 시 화면을 직접 갱신하지 않고, 서버 브로드캐스트를 받아 반영해 **모든 참여자의 화면이 동일**하도록 합니다

### 폴더 구조

```
hasi-collab/
├── app/
│   ├── client/                 # React 프론트엔드
│   │   └── src/
│   │       ├── api/            # 통신 계층 (client.ts, stomp.ts, messenger.ts)
│   │       ├── components/     # 공용 UI 컴포넌트
│   │       ├── hooks/          # 조율 계층 (useAuth, useChannelMessage)
│   │       ├── pages/          # 화면 단위 컴포넌트
│   │       ├── store/          # Zustand 전역 상태
│   │       └── types/          # openapi.ts (자동 생성)
│   ├── service/                # Spring Boot REST API (8080)
│   │   └── src/main/java/com/hasi/service/
│   │       ├── auth/           # 인증 · 소셜 로그인
│   │       ├── workspace/      # 워크스페이스 · 멤버 · 채널 · 보드
│   │       ├── mail/           # 메일 연동
│   │       └── common/         # 공통 응답 · 예외 처리
│   └── messenger/              # Spring Boot 실시간 서버 (8081)
│       └── src/main/java/com/hasi/messenger/
│           ├── channel/        # 채널 메시지
│           └── dm/             # 다이렉트 메시지
├── docs/
│   ├── openapi/                # API 명세 (단일 소스)
│   │   ├── openapi.yaml        # 루트 명세
│   │   ├── paths/              # 엔드포인트 정의
│   │   └── components/         # 요청 · 응답 · 에러 스키마
│   ├── readme/                 # 다국어 README
│   └── tutorials/              # 팀 온보딩 문서
├── docker-compose.yml          # 인프라 컨테이너
├── start.sh                    # 전체 실행 스크립트
└── seed.sh                     # 테스트 데이터 주입
```

---

## 시작하기

### 사전 준비

- Docker Desktop
- JDK 25 이상
- Node.js 20 이상
- Git Bash (Windows 사용 시)

### 실행

```bash
# 1. 저장소 클론
git clone https://github.com/Dongjun320/hasi-collab.git
cd hasi-collab

# 2. 환경 변수 설정 (팀에서 전달받은 값 입력)
#    app/service/.env 생성

# 3. 전체 실행 (인프라 + 백엔드 + 프론트엔드)
bash start.sh
```

실행 후 브라우저에서 `http://localhost:5173` 으로 접속합니다.

| 주소 | 설명 |
| --- | --- |
| http://localhost:5173 | 웹 애플리케이션 |
| http://localhost:8080/swagger-ui.html | REST API 문서 |
| http://localhost:8203 | RabbitMQ 관리 UI |

### 테스트 계정

로컬 DB에 테스트 계정과 워크스페이스를 주입합니다.

```bash
bash seed.sh
```

| 계정 | 비밀번호 | 역할 |
| --- | --- | --- |
| test_user1@example.com | 12345678 | test_workspace 소유자 |
| test_user2@example.com | 12345678 | 멤버 |
| test_user3@example.com | 12345678 | 멤버 |

> 여러 번 실행해도 중복 생성되지 않습니다. 협업 기능을 테스트할 때는 **일반 창과 시크릿 창에 서로 다른 계정으로 로그인**하면 편리합니다.

---

## 개발 가이드

### API 명세 관리

`docs/openapi/openapi.yaml` 이 **API의 단일 소스**입니다. 명세를 수정하면 프론트 타입과 백엔드 인터페이스가 자동 생성됩니다.

```bash
# 프론트엔드 타입 재생성 (app/client)
npm run generate:api

# 백엔드 인터페이스 재생성 (app/service)
./mvnw clean compile
```

> `openapi.ts` 는 자동 생성 파일이라 Git에 포함되지 않습니다. 명세가 변경되면 **각자 재생성**해야 합니다.

### 상태 관리 규칙

| 스토어 | 담당 도메인 |
| --- | --- |
| `authStore` | 로그인 사용자 · 토큰 |
| `workspaceStore` | 워크스페이스 목록 · 현재 워크스페이스 · 채널 |
| `memberStore` | 워크스페이스 멤버 목록 |
| `channelStore` | 채널 메시지 |
| `dmStore` | 다이렉트 메시지 |
| `friendStore` | 친구 목록 |
| `notificationStore` | 알림 |
| `uiStore` | 사이드바 · 패널 등 화면 상태 |

- 여러 화면이 공유하는 상태만 스토어에 둡니다. 한 화면에서만 쓰는 값은 컴포넌트 지역 상태로 관리합니다
- 통신 계층(`api/`)은 스토어를 알지 못합니다. 상태 반영은 **훅에서** 처리합니다

### 환경 변수

`app/service/.env` 에 다음 값이 필요합니다. 실제 값은 팀에서 비공개로 전달받습니다.

```bash
# 소셜 로그인
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
LINE_CLIENT_ID=
LINE_CLIENT_SECRET=
AMAZON_CLIENT_ID=
AMAZON_CLIENT_SECRET=
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=

# 메일 발송
MAIL_USERNAME=
MAIL_PASSWORD=
```

> `.env` 는 Git에 포함되지 않습니다. 절대 커밋하지 마세요.

---

## 진행 현황

| 기능 | 백엔드 | 프론트엔드 |
| --- | --- | --- |
| 회원가입 · 이메일 인증 | 완료 | 완료 |
| 로그인 · 로그아웃 | 완료 | 완료 |
| 소셜 로그인 | 완료 | 완료 |
| 비밀번호 재설정 | 완료 | 진행 중 |
| 워크스페이스 | 완료 | 진행 중 |
| 멤버 · 초대 | 완료 | 예정 |
| 채널 채팅 | 완료 | 진행 중 |
| 다이렉트 메시지 | 완료 | 예정 |
| 칸반 보드 | 진행 중 | 예정 |
| 알림 · 친구 | 예정 | 진행 중 |
| 메일 연동 | 완료 | 완료 |

---

## 팀

| 역할 | 담당 |
| --- | --- |
| 팀 리더 · API 설계 · 상태 관리 | 김동준 |
| 인증 백엔드 · 소셜 로그인 | 김지환 |
| 워크스페이스 · 멤버 · 채널 백엔드 | 박종서 |
| 실시간 메시징 · 인프라 | 정진우 |
| 인증 프론트엔드 · 디자인 시스템 | 박규태 |
| 홈 · 알림 · 친구 프론트엔드 | 김상현 |
