# [설계] 토글 갱신 → STOMP 실시간 전환 요구사항

작성: 김상현 · 2026-08-19
대상: 현재 "패널/모달을 열 때만 갱신"되는 5곳을 STOMP 실시간으로 전환.

---

## 공통 방침

### 권장 패턴: "변경 신호 + refetch"
델타(변경 내용)를 그대로 그리는 대신, **"이 목록이 바뀌었다"는 신호만 STOMP로 보내고 클라이언트가 해당 목록을 다시 조회**한다.
- 장점: 페이로드 스키마 단순, 기존 REST 조회 재사용, 정합성 안전
- 대상 5곳은 변경 빈도가 낮아 이 방식이 적합 (고빈도인 칸반 태스크만 델타 고려)

### 기존 STOMP 컨벤션 (재사용)
| 목적지 | 용도 |
|---|---|
| `/topic/channel.{id}` / `.read` | 채널 메시지 / 읽음 |
| `/topic/workspace.{id}.presence` | 워크스페이스 접속상태 |
| `/user/queue/presence` | 친구 접속상태 |
| `/user/queue/notifications` | 알림 |
| `/user/queue/dm` `/errors` | DM / 에러 |

→ 신규도: **범위 브로드캐스트 = `/topic/{scope}.{id}.{event}`**, **개인 대상 = `/user/queue/{event}`**

### 데이터 흐름
```
service(이벤트 발행) → MessengerNotifier(@TransactionalEventListener) → messenger 내부 API → STOMP push → 프론트 구독 → refetch
```

---

## 전환 대상 5곳

### 1. 친구 목록 (FriendSidebar / 홈 온라인 친구 수)
- 현재: 친구 패널 열 때 + 홈 진입/수락 시 `fetchFriends()`
- 비실시간: 요청 **수락됨(요청자)**, 친구 **삭제됨(상대방)**
- 목적지(제안): `/user/queue/friends` (개인)
- 페이로드: `{ "reason": "REQUEST|ACCEPTED|REJECTED|REMOVED" }` (신호용 → refetch)
- 백엔드: 수락 시 요청자에게 push / `removeFriend`에 이벤트 발행 추가 → 상대방 push
- 프론트: `subscribeToFriends()` + 수신 시 `fetchFriends()`

### 2. 채널 멤버 목록·카운트 (ChannelsPage)
- 현재: 워크스페이스 변경 + 멤버 목록 열 때 `loadMembers()`
- 비실시간: 멤버 입장/퇴장/강퇴/역할변경 (온라인 점만 실시간)
- 목적지(제안): `/topic/workspace.{workspaceId}.members`
- 페이로드: `{ "reason": "JOINED|LEFT|REMOVED|ROLE_CHANGED", "userId": number }`
- 백엔드: `MemberService` join/leave/remove/patchRole/transferOwnership 이벤트 발행
- 프론트: `subscribeToWorkspaceMembers(workspaceId)` + 수신 시 `loadMembers()`

### 3. 채널 목록 (WorkspaceLayout)
- 현재: 워크스페이스 전환 시 1회. 생성/삭제는 본인만 낙관적 업데이트
- 비실시간: 남이 채널 생성/수정/삭제 시
- 목적지(제안): `/topic/workspace.{workspaceId}.channels`
- 페이로드: `{ "reason": "CREATED|UPDATED|DELETED", "channelId": number }`
- 백엔드: `ChannelService` create/patch/delete 이벤트 발행
- 프론트: `subscribeToWorkspaceChannels(workspaceId)` + 수신 시 `fetchChannels(workspaceId)`

### 4. 워크스페이스 목록 (WorkspaceHome / 레일)
- 현재: mount + 초대 수락 후 `fetchWorkspaces()`
- 비실시간: 남이 나를 워크스페이스에 추가/역할변경/강퇴 시
- 목적지(제안): `/user/queue/workspaces` (개인)
- 페이로드: `{ "reason": "ADDED|REMOVED|ROLE_CHANGED", "workspaceId": number }`
- 백엔드: 초대수락/멤버추가/역할변경/강퇴 시 대상 사용자에게 push
- 프론트: `subscribeToMyWorkspaces()` + 수신 시 `fetchWorkspaces()`

### 5. 칸반 보드/태스크 (KanbanPage)
- 현재: mount/워크스페이스 변경 시 조회
- 비실시간: 남의 태스크 생성/이동/수정/삭제, 보드 변경
- 목적지(제안): `/topic/board.{boardId}`
- 페이로드: `{ "reason": "TASK_CHANGED|BOARD_CHANGED", "boardId": number }` (고빈도면 델타형 검토)
- 백엔드: `BoardService` board/task CRUD 이벤트 발행
- 프론트: `subscribeToBoard(boardId)` + 수신 시 refetch

---

## 담당별 정리
### 🔵 백엔드 (박종서 — 서비스 이벤트 발행)
| 곳 | 위치 |
|---|---|
| 1 친구 | `FriendService.acceptRequest`(→요청자), `removeFriend`(→상대방) |
| 2 멤버 | `MemberService` join/leave/remove/patchRole/transferOwnership |
| 3 채널 | `ChannelService` create/patch/delete |
| 4 워크스페이스 | 초대수락/멤버추가/역할변경/강퇴 |
| 5 칸반 | `BoardService` board/task CRUD |

### 🟣 실시간 인프라 (정진우 — messenger)
- 각 이벤트→STOMP push하는 messenger 핸들러 (`MessengerNotifier` 리스너 추가)
- 신규 목적지 5종: `/user/queue/friends`, `/topic/workspace.{id}.members`, `/topic/workspace.{id}.channels`, `/user/queue/workspaces`, `/topic/board.{id}`

### 🟡 Hook·구독 계층 (PM/김동준 — stomp.ts + hooks)
- `stomp.ts` 구독 헬퍼 5종 + 화면별 hook (수신 → store refetch)

### 🟢 컴포넌트·store (김상현 — 홈·통지·친구)
- `friendStore.fetchFriends` ✅ 이미 있음 / 컴포넌트는 store 구독이라 자동 반영
- → 상현 범위는 대부분 준비 완료. 핵심은 백엔드+messenger+hook 세 계층.

---

## 우선순위 제안
1. 친구(1)·워크스페이스(4) — 개인 큐, 체감 큼
2. 채널(3)·멤버(2) — 워크스페이스 토픽 하나로 묶어 처리
3. 칸반(5) — 별도 보드 토픽 (델타 검토)
