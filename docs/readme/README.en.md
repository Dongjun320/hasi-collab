# Hasi Collab Platform

[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/Dongjun320/hasi-collab/blob/main/docs/readme/README.en.md)
[![日本語](https://img.shields.io/badge/lang-日本語-green.svg)](https://github.com/Dongjun320/hasi-collab/blob/main/README.md)
[![한국어](https://img.shields.io/badge/lang-한국어-yellow.svg)](https://github.com/Dongjun320/hasi-collab/blob/main/docs/readme/README.ko.md)

- [Hasi Collab Platform](#hasi-collab-platform)
  - [Overview](#overview)
    - [Who we built this for](#who-we-built-this-for)
  - [Key Features](#key-features)
    - [Account · Authentication](#account--authentication)
    - [Workspace](#workspace)
    - [Members · Invitations](#members--invitations)
    - [Channel Chat](#channel-chat)
    - [Direct Messages](#direct-messages)
    - [Notifications · Friends](#notifications--friends)
    - [Mail Integration](#mail-integration)
  - [Tech Stack](#tech-stack)
  - [System Architecture](#system-architecture)
    - [Service Composition](#service-composition)
    - [Data Flow](#data-flow)
    - [Folder Structure](#folder-structure)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Running](#running)
    - [Test Accounts](#test-accounts)
  - [Development Guide](#development-guide)
    - [API Specification Management](#api-specification-management)
    - [State Management Rules](#state-management-rules)
    - [Environment Variables](#environment-variables)
  - [Status](#status)
  - [Team](#team)

## Overview

Hasi Collab is **a platform that brings your team together in one place**.

We built it to solve the situation where the messenger lives on its own and the to-dos are scattered across other tools. The goal is a single workspace where you talk, where that conversation turns straight into a task card, and where the whole team shares the same context.

### Who we built this for

- Teams whose **context keeps breaking** as they move between tools
- Teams with plenty of conversation but a **blurry picture of who is doing what**

---

## Key Features

### Account · Authentication

You create an account through email verification and stay signed in with the issued token.

| Feature | What it means for the user |
| --- | --- |
| Sign-up | Enter email → receive verification code → verify code → set nickname · password |
| Email verification | A 6-digit code is sent by mail and stays valid for 10 minutes |
| Login | The token issued after login signs you in automatically next time |
| Social login | Start quickly with a Google · LINE · Amazon · X account |
| Password reset | Receive a verification code at your registered email and set a new password |
| Logout | Expires the authentication data on the server and resets local state |

### Workspace

A team-level working space. A user can only see **the workspaces they belong to**.

- When a workspace is created, its creator automatically becomes the owner (OWNER)
- The home screen shows every workspace you have joined at a glance and lets you switch between them
- Each workspace has its own independent channels · members · boards

### Members · Invitations

- **Member list** — Check the participants, their roles (owner / admin / member), and their online status
- **Invitations** — Invite teammates by nickname; the invited person can accept or decline
- **Permission management** — Owners · admins can change member roles or remove members

### Channel Chat

The team talks in real time in topic-based channels.

- When you enter a channel, **the previous conversation loads automatically**
- Messages arrive in real time, with no need to refresh
- You can **edit · delete** the messages you sent; a deleted message leaves only its placeholder

### Direct Messages

Talk one-on-one with a specific teammate. Pick the other person and a space just for the two of you opens, with the same real-time send · receive · edit · delete support as channels.

### Notifications · Friends

- **Notifications** — Check new messages · mentions · invitations · system announcements in one place and mark them as read
- **Friends** — Register the teammates you talk to often as friends to quickly see their online status and unread messages

### Mail Integration

Connect an external mail account (Gmail and so on) to check your mail without leaving the app.

---

## Tech Stack

| Area | Technology |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v4, Zustand, React Router |
| Backend | Spring Boot 4, Spring Security, Spring Data JPA |
| Real-time communication | WebSocket, STOMP, RabbitMQ |
| Database | PostgreSQL 15, Redis 7 |
| API management | OpenAPI 3, openapi-typescript, openapi-generator |
| Infrastructure | Docker Compose |
| Internationalization | i18next (Korean / Japanese) |

---

## System Architecture

### Service Composition

The system consists of three applications and three infrastructure containers.

| Component | Port | Role |
| --- | --- | --- |
| `app/client` | 5173 | Web frontend (Vite Dev Server) |
| `app/service` | 8080 | Authentication · workspace · member · board REST API |
| `app/messenger` | 8081 | Real-time chat · DM processing (STOMP) |
| PostgreSQL | 8200 | Persistent storage for users · workspaces · messages |
| Redis | 8201 | Verification code · refresh token · session cache |
| RabbitMQ | 8202 / 8203 / 8204 | STOMP message broker (AMQP / management UI / STOMP) |

> The REST API and real-time messaging are **split into separate applications** so that chat traffic does not affect ordinary API responses.

### Data Flow

The frontend follows a one-way flow.

```
network  →  hook  →  store  →  component
(comms)     (wiring) (state)   (view)
```

| Layer | Role | Example |
| --- | --- | --- |
| network | Only responsible for exchanging data with the server | `api/client.ts`, `api/stomp.ts`, `api/messenger.ts` |
| hook | Reflects communication results into state, manages subscribe · unsubscribe | `useChannelMessage` |
| store | Holds global state | `authStore`, `channelStore`, `workspaceStore` |
| component | Subscribes to state and renders the screen | `ChannelsPage`, `WorkspaceHome` |

- The screen **only looks at the store.** It does not distinguish whether the data came from real time (STOMP) or from history (REST)
- When a message is sent, the screen is not updated directly; the server broadcast is applied instead, so that **every participant sees the same thing**

### Folder Structure

```
hasi-collab/
├── app/
│   ├── client/                 # React frontend
│   │   └── src/
│   │       ├── api/            # Communication layer (client.ts, stomp.ts, messenger.ts)
│   │       ├── components/     # Shared UI components
│   │       ├── hooks/          # Coordination layer (useAuth, useChannelMessage)
│   │       ├── pages/          # Screen-level components
│   │       ├── store/          # Zustand global state
│   │       └── types/          # openapi.ts (auto-generated)
│   ├── service/                # Spring Boot REST API (8080)
│   │   └── src/main/java/com/hasi/service/
│   │       ├── auth/           # Authentication · social login
│   │       ├── workspace/      # Workspace · member · channel · board
│   │       ├── mail/           # Mail integration
│   │       └── common/         # Shared responses · exception handling
│   └── messenger/              # Spring Boot real-time server (8081)
│       └── src/main/java/com/hasi/messenger/
│           ├── channel/        # Channel messages
│           └── dm/             # Direct messages
├── docs/
│   ├── openapi/                # API specification (single source)
│   │   ├── openapi.yaml        # Root specification
│   │   ├── paths/              # Endpoint definitions
│   │   └── components/         # Request · response · error schemas
│   ├── readme/                 # Multilingual README
│   └── tutorials/              # Team onboarding documents
├── docker-compose.yml          # Infrastructure containers
├── start.sh                    # Full run script
└── seed.sh                     # Test data injection
```

---

## Getting Started

### Prerequisites

- Docker Desktop
- JDK 25 or later
- Node.js 20 or later
- Git Bash (on Windows)

### Running

```bash
# 1. Clone the repository
git clone https://github.com/Dongjun320/hasi-collab.git
cd hasi-collab

# 2. Set environment variables (enter the values shared by the team)
#    Create app/service/.env

# 3. Run everything (infrastructure + backend + frontend)
bash start.sh
```

Once it is running, open `http://localhost:5173` in your browser.

| Address | Description |
| --- | --- |
| http://localhost:5173 | Web application |
| http://localhost:8080/swagger-ui.html | REST API documentation |
| http://localhost:8203 | RabbitMQ management UI |

### Test Accounts

Injects test accounts and a workspace into the local DB.

```bash
bash seed.sh
```

| Account | Password | Role |
| --- | --- | --- |
| test_user1@example.com | 12345678 | test_workspace owner |
| test_user2@example.com | 12345678 | Member |
| test_user3@example.com | 12345678 | Member |

> Running it multiple times does not create duplicates. When testing collaboration features, it is convenient to **log in with different accounts in a normal window and an incognito window**.

---

## Development Guide

### API Specification Management

`docs/openapi/openapi.yaml` is **the single source of the API**. When you modify the specification, the frontend types and the backend interfaces are generated automatically.

```bash
# Regenerate frontend types (app/client)
npm run generate:api

# Regenerate backend interfaces (app/service)
./mvnw clean compile
```

> `openapi.ts` is an auto-generated file, so it is not included in Git. When the specification changes, **each person has to regenerate it**.

### State Management Rules

| Store | Domain in charge |
| --- | --- |
| `authStore` | Logged-in user · token |
| `workspaceStore` | Workspace list · current workspace · channels |
| `memberStore` | Workspace member list |
| `channelStore` | Channel messages |
| `dmStore` | Direct messages |
| `friendStore` | Friend list |
| `notificationStore` | Notifications |
| `uiStore` | Screen state such as sidebar · panels |

- Only state shared by several screens goes into a store. Values used by a single screen are kept as component-local state
- The communication layer (`api/`) knows nothing about the stores. State updates are handled **in the hooks**

### Environment Variables

The following values are required in `app/service/.env`. The actual values are shared privately by the team.

```bash
# Social login
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
LINE_CLIENT_ID=
LINE_CLIENT_SECRET=
AMAZON_CLIENT_ID=
AMAZON_CLIENT_SECRET=
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=

# Mail sending
MAIL_USERNAME=
MAIL_PASSWORD=
```

> `.env` is not included in Git. Never commit it.

---

## Status

| Feature | Backend | Frontend |
| --- | --- | --- |
| Sign-up · email verification | Done | Done |
| Login · logout | Done | Done |
| Social login | Done | Done |
| Password reset | Done | In progress |
| Workspace | Done | In progress |
| Members · invitations | Done | Planned |
| Channel chat | Done | In progress |
| Direct messages | Done | Planned |
| Kanban board | In progress | Planned |
| Notifications · friends | Planned | In progress |
| Mail integration | Done | Done |

---

## Team

| Role | Member |
| --- | --- |
| Team lead · API design · state management | Kim Dongjun |
| Authentication backend · social login | Kim Jihwan |
| Workspace · member · channel backend | Park Jongseo |
| Real-time messaging · infrastructure | Jeong Jinwoo |
| Authentication frontend · design system | Park Gyutae |
| Home · notifications · friends frontend | Kim Sanghyun |
