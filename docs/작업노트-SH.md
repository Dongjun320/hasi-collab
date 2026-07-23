# 작업 노트 — SH (김상현)

> 담당: 사이드바 · 서버 채팅(채널) · 워크스페이스 UI · 친구 목록 · 알림 패널
> 기계를 옮기거나 세션이 바뀔 때 이 파일부터 읽으면 맥락이 이어집니다.
> **작업 후 갱신할 것.** 코드·커밋에 안 남는 "왜 그렇게 했는지"를 여기에 적습니다.

최종 갱신: 2026-07-23

---

## 1. 담당 파일

```
store/      uiStore · workspaceStore · friendStore · notificationStore
components/ WorkspaceSidebar · FriendSidebar · NotificationSidebar
            Tooltip · UserSearchBox
pages/      WorkspaceHome · WorkspaceLayout · ChannelsPage
styles/     globals.css (.app-chrome)
```

**남의 영역** — `hooks/`(PM 담당, 정진우·김동준) / `LoginPage`(박규태) /
`api/stomp.ts`·`messenger.ts`(정진우) / 백엔드 전체

---

## 2. 지금 상태

- 브랜치 `SH` — dev와 동기화됨 (`42c4dd0`)
- 타입 에러 0개 (담당 파일 기준)
- 목데이터 잔존: `WorkspaceHome`의 `recentActivities` / `upcomingEvents` 2건뿐
  (서버에 해당 개념 자체가 없어 API가 생겨야 제거 가능)

### 연동 완료 API
```
워크스페이스  GET /me · GET /{id} · POST · DELETE /{id}
채널          GET · POST · PATCH · DELETE  (하위채널 parentId 포함)
멤버·초대     POST /members · GET /invitations/received · PATCH /invitations/{id}
친구          GET /friends · POST·DELETE /friends/{id}
사용자        GET /users/search
채팅          useChannelMessage 훅 (STOMP + REST 히스토리)
```

### 미연동 (스펙엔 있음)
```
GET /api/invitations/sent                      보낸 초대 — 알림에 표시하려던 것
GET /api/workspaces/search
PATCH·DELETE /workspaces/{id}/members/{userId}  권한변경·강퇴 (UI 없음)
```

---

## 3. 진행 중

**채널 삭제 무반응** — 코드는 받았고 아직 미적용
- 백엔드는 `CH_004 "하위 채널이 있어 삭제할 수 없습니다"`로 정상 거부
- 프론트가 `console.error`만 찍고 넘어가서 무반응으로 보임
- 조치: ① `WorkspaceSidebar`에서 자식 있으면 삭제 버튼 disabled
       ② `WorkspaceLayout`에 `channelError` state + 안내 배너

---

## 4. 다른 사람 대기 중

| 대상 | 내용 | 상태 |
|---|---|---|
| 박종서 | `GET /workspaces/{id}/members` **501 미구현** → 채널 멤버 카운트가 0명 | 전달함 |
| 박종서 | 워크스페이스 생성 시 기본 채널(공지사항·채널1~3) 자동 생성 | 협의 완료, 미착수 |
| 박종서 | unread 지원 — `last_read_message_id` 컬럼 + `unreadCount` + 읽음처리 엔드포인트 | 처리 중 |
| 정진우 | messenger(8081) **CORS 미설정** → 채널 이동 시 메시지 사라짐 | 전달함 |
| 정진우 | RabbitMQ STOMP 릴레이 `Broker not available` | 전달함 |
| 백엔드 | 친구 **요청/수락 흐름 없음** — `addFriend`가 즉시 양방향 저장, `status` 필드 부재 | 미전달 |
| 박규태 | LoginPage Enter 키 미동작 (`onKeyDown`·`<form>` 없음) | 미전달 |
| 김지환? | 소셜 연동 엔드포인트 부재 — `linkSocialAccount`는 있으나 컨트롤러 없음 | 미전달 |

---

## 5. 판단 이력 (코드에 안 남는 것)

**enum 대소문자 대이동 (2026-07-23)**
백엔드가 enum을 대문자로 통일했는데 `ddl-auto: update`가 기존 CHECK 제약을 갱신하지 않아
로컬 DB가 소문자로 남음 → 로그인·워크스페이스 조회·채널 생성이 전부 500.
`users` / `workspace_members` / `channel_members` 세 테이블에 아래를 실행해야 함:
```sql
ALTER TABLE <t> DROP CONSTRAINT <t>_<col>_check;
UPDATE <t> SET <col> = UPPER(<col>);
ALTER TABLE <t> ADD CONSTRAINT <t>_<col>_check CHECK (<col> IN (...대문자...));
```
프론트도 따라 대문자로 정렬함. `friendStatusOf()` 폴백을 둬서 모르는 값이 와도 안 죽게 함.
※ `tasks_priority_check`는 아직 소문자 — 칸반 연동 시 같은 문제 예상.

**보류한 것**
- 친구 메모 → 서버에 필드 없음. localStorage 대신 **메모리 유지**로 두고 API 요청하기로 함
- unread → 숫자로 요청 (서버가 숫자로 주면 프론트에서 점으로도 쓸 수 있어 유연)
- 메일 기능 → 기간 제약으로 최종 스코프 제외. 코드·백엔드는 보존, 라우트만 제거
- HOME 위젯 커스터마이징 → react-grid-layout은 과하다고 판단, 위젯 on/off 방식 검토 중

**설계 결정**
- 채널 id를 `number`로 통일 (프론트가 `"design-general"` 식으로 지어내던 id 폐기)
  → 이전에 가짜 id 때문에 존재하지 않는 워크스페이스로 초대가 나간 사고 있었음
- 하위 채널은 **2단 제한** (좁은 사이드바에서 무한 중첩은 들여쓰기 한계)
- 상위 채널도 대화 가능 — 이름 클릭=이동 / 화살표 클릭=접기 (stopPropagation)
- `Tooltip`은 portal 방식 — 서버 레일의 `overflow-x-hidden`에 잘리던 문제 때문
- 워크스페이스 조회를 `workspaceStore.fetchWorkspaces`로 올림 → HOME·사이드바·초대수락 후 재사용

---

## 6. 자주 밟는 함정

- **`npx tsc --noEmit`은 아무것도 검사하지 않음** (`tsconfig.json`이 `files: []` + references)
  → 반드시 `npx tsc -p tsconfig.app.json --noEmit`
- `src/components/ui/`(shadcn) 에러는 의존성 미설치 탓, 무시하고 필터링
- Git Bash에서 `curl -d '{"한글"}'` 은 인코딩이 깨져 500이 남 → 파일로 `--data-binary @f.json`
- openapi 스펙이 바뀌면 **프론트** `npm run generate:api`, **백엔드** `./mvnw clean compile`
- store에 액션 추가할 때 기존 것을 덮어쓰는 사고가 3번 발생
  → 새 액션은 파일 맨 아래 `clear` 위에 붙일 것

---

## 7. 실행 환경

```
docker compose up -d          postgres 8200 / redis 8201 / rabbitmq 8202-8204
app/service    8080           로그인·워크스페이스·채널·친구·초대
app/messenger  8081           채팅 (REST 히스토리 + STOMP)
app/client     5173           npm run dev  ※ CORS가 5173만 허용, 포트 밀리면 403
```

테스트 계정: `test_user1~3@example.com` / `12345678` (전부 동일)
user1이 `test_workspace` 소유자. 재주입은 `seed_test_data.sql`.
