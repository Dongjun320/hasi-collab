// 워크스페이스의 모든 채널을 구독해서, "열려있지 않은" 채널에 새 메시지가 오면 뱃지를 +1.
// 열린 채널은 useChannelMessage가 read 처리하므로 여기선 activeChannelId 가드로 스킵한다.
// stomp의 채널 구독은 멀티플렉스(채널당 소켓 1개, 리스너만 추가)라 중복 구독해도 안전.

import { useEffect, useRef } from 'react'
import { connectStomp, subscribeToChannel } from '../api/stomp'
import { useAuthStore } from '../store/authStore'
import { useChannelStore } from '../store/channelStore'

export function useWorkspaceUnread(
    channels: { id: number }[],
    activeChannelId: number | null,
) {
    // 구독 콜백 클로저가 항상 최신 activeChannelId를 보도록 ref로 유지
    const activeRef = useRef(activeChannelId)
    activeRef.current = activeChannelId

    // 채널 목록(id 집합)이 바뀔 때만 재구독하기 위한 키
    const channelKey = channels.map((c) => c.id).join(',')

    useEffect(() => {
        const token = useAuthStore.getState().accessToken
        const myUid = useAuthStore.getState().user?.uid
        if (!token || myUid == null || channels.length === 0) return

        let unsubs: (() => void)[] = []
        let cancelled = false

        connectStomp(token).then(() => {
            if (cancelled) return
            unsubs = channels.map((c) =>
                subscribeToChannel(c.id, (msg) => {
                    if (c.id === activeRef.current) return            // 열린 채널 → 스킵(그 훅이 read 처리)
                    if (msg.sender === String(myUid)) return           // 내가 보낸 메시지 → 제외
                    useChannelStore.getState().incrementUnread(c.id)   // 나머지 → 뱃지 +1
                })
            )
        }).catch(console.error)

        return () => {
            cancelled = true
            unsubs.forEach((u) => u())
        }
    }, [channelKey])

    return null
}