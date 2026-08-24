# [요청] DM 알림 추가 (합치기 정책 B) — 정진우님(messenger)

작성: 김상현 · 2026-08-19

## 개요
새 DM 수신 시 **종(알림)** 이 뜨게 한다. DM·알림이 모두 messenger 안에 있어 **messenger 단일 모듈**에서 처리 가능(친구/초대처럼 service 연동 불필요).

- 생성 위치: `DmService.createMessage`의 `broadcast(outbound)` **직후**, **수신자에게만** `notificationService.create(...)`
- 타입: `MESSAGE`
- 합치기 정책: **B = 대화(상대)당 1건** (슬랙식). dedupKey = `DM:{senderId}:{receiverId}`

## ⚠️ 핵심 제약과 해결 (B가 제대로 되려면 필수)
현재 `insertIfAbsent`는 `dedup_key` **전역 UNIQUE** + `ON CONFLICT (dedup_key) DO NOTHING`.
→ B로 하면 **최초 1건만 뜨고, 읽은 뒤에도 행이 남아 새 DM이 계속 conflict** → 재알림 불가.

### 해결: "미해결(resolved 안 됨) 건에 한해 UNIQUE" (부분 유니크 인덱스)
```sql
-- 전역 UNIQUE(dedup_key) → 부분 유니크로 대체
CREATE UNIQUE INDEX ux_notifications_dedup_unresolved
    ON notifications (dedup_key)
    WHERE resolved_at IS NULL;
```
```sql
-- insertIfAbsent의 ON CONFLICT도 부분 인덱스를 타게 수정
... ON CONFLICT (dedup_key) WHERE resolved_at IS NULL DO NOTHING
```
효과:
- 안 읽은 DM 알림 있으면 → 새 DM conflict → **합쳐짐(재푸시 X)** ✅
- 수신자가 읽어 **resolved되면** → 다음 DM 정상 insert → **다시 종 알림** ✅
- 정확히 "안 읽은 DM 있는 상대별로 종 1건" UX
- 기존 INVITE/FRIEND는 subject별로 이미 유일 → 부분 유니크로 바꿔도 영향 없음

## 읽음/해제 흐름
- 수신자가 해당 DM 대화 열면 → 그 DM 알림 **resolve** (dedupKey `DM:{상대}:{나}`)
- 기존 `resolve(Collection<String> dedupKeys)` 재사용
- messenger는 누가 어떤 DM방 여는지 모름 → **DM 열람 시 프론트가 resolve 요청** (채널 read 커서와 동일 발상)

## 페이로드
```json
{ "actorId": "<senderId>", "preview": "<메시지 내용 일부>" }
```
- 닉네임은 messenger에 없으므로 `actorId`만. **프론트가 friendStore/memberStore로 닉네임 매핑**

## 담당 정리
| 계층 | 작업 | 담당 |
|---|---|---|
| DM 알림 생성 (`DmService` + 부분 유니크 인덱스/insertIfAbsent) | 핵심 | 🟣 정진우(messenger) |
| DM 열람 시 resolve 트리거 | 소 | 🔵 DM 담당(프론트) |
| 알림 렌더 + 닉네임 폴백 (`fromMessengerNotification` 'message') | 소 | 🟢 김상현(통지) |

## 프론트 현황
- `notificationStore.fromMessengerNotification`에 이미 `case 'message'` 있음 → 표시 가능
- `actorNickname` 없으면 "알 수 없는 사용자"로 뜸 → actorId로 닉네임 찾는 폴백 보완 예정(상현)

## 미결정(팀 논의)
- 억제 범위: v1은 "항상 생성 + 열람 시 resolve" (온라인/활성대화 스킵은 추후)
- 미리보기 텍스트 노출 범위(프라이버시)
