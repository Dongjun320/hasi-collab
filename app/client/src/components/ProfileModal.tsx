import { useEffect, useState } from "react";
import { BigModal } from "./BigModal";
import { useUiStore } from "../store/uiStore";
import { api } from "../api/client";
import { useAuthStore } from "../store/authStore";
import { useMemberStore } from "../store/memberStore";

export function ProfileModal() {
    const { activeModal, closeModal } = useUiStore();
    const open = activeModal === "profile";

    const [me, setMe] = useState<any>(null);
    const [nickname, setNickname] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [dept, setDept] = useState("");
    const [position, setPosition] = useState("");

    const activities = [
        { text: "#일반 채널에 메시지 작성", time: "5분 전", color: "bg-green-400" },
        { text: "김동준님과 대화 시작", time: "1시간 전", color: "bg-yellow-400" },
        { text: "프로필 정보 업데이트", time: "어제", color: "bg-orange-400" },
    ];

    useEffect(() => {
        if (!open) return;
        (async () => {
            const { data } = await api.GET("/api/users/me");
            setMe(data);
            setNickname(data?.nickname ?? "");
            setStatusMessage((data as any)?.statusMessage ?? "");
        })();
    }, [open]);

    const myUid = useAuthStore((s) => s.user?.uid);
    const [nicknameError, setNicknameError] = useState("");

    const saveNickname = async () => {
        const trimmed = nickname.trim();
        if (!trimmed || trimmed === me?.nickname) return;   // 변경 없음

        // 저장 시점에 중복검사
        const { data, error: searchErr } = await api.GET("/api/users/search", { params: { query: { nickname: trimmed } } });
        if (!searchErr && data?.uid && data.uid !== myUid && data.nickname === trimmed) {
            setNicknameError("이미 사용 중인 닉네임입니다");
            return;   // 중복이면 저장 중단
        }

        // 통과 → 실제 변경
        const { error } = await api.PATCH("/api/users/me/nickname", { body: { nickname: trimmed } });
        if (error) { console.error("닉네임 변경 실패:", error); return; }

        setNicknameError("");
        setMe((p: any) => ({ ...p, nickname: trimmed }));
        const u = useAuthStore.getState().user;
        if (u) useAuthStore.setState({ user: { ...u, nickname: trimmed } });
        // 서버 접속자(온라인) 멤버 패널(ChannelsPage = memberStore)의 내 닉네임도 갱신
        const ms = useMemberStore.getState();
        ms.setMembers(ms.members.map((m) => m.userId === myUid ? { ...m, nickname: trimmed } : m));
    };

    const saveStatus = async () => {
        await api.PATCH("/api/users/me/status-message", { body: { statusMessage } });
        setMe((p: any) => ({ ...p, statusMessage }));
    };

    const saveDeptPosition = () => {
        // TODO: 백엔드 부서/직급 API 생기면 PATCH 연결
        setMe((p: any) => ({ ...p, department: dept, position }));
    };

    return (
        <BigModal open={open} onClose={closeModal} title="내 프로필">
            <div className="max-w-xl mx-auto">
                {/* 고정: 프로필 보기 (스크롤해도 상단에 고정) */}
                <div className="sticky top-0 bg-white z-10 px-6 pt-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-5">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#A8E6B8] to-[#5CC87A] flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                            {me?.nickname?.charAt(0) || "나"}
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-xl font-bold text-[#2C3E50]">{me?.nickname || "-"}</h2>
                            <p className="text-sm text-gray-500 mt-0.5">{me?.statusMessage || "상태메시지 없음"}</p>
                            <p className="text-xs text-gray-400 mt-1">{me?.department || "부서 미정"} · {me?.position || "직급 미정"}</p>
                        </div>
                    </div>

                    <div className="space-y-2 mt-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">이메일</span>
                            <span className="text-[#2C3E50] font-medium">{me?.email ?? "-"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">가입일</span>
                            <span className="text-[#2C3E50] font-medium">{me?.createdAt?.slice(0, 10) ?? "-"}</span>
                        </div>
                    </div>
                </div>

                {/* 스크롤: 최근활동 + 편집 */}
                <div className="px-6 py-6 space-y-6">
                    {/* ── 최근 활동 (목업 유지) ── */}
                    <div>
                        <h3 className="font-bold text-[#2C3E50] mb-3">최근 활동</h3>
                        <div className="space-y-2">
                            {activities.map((a, idx) => (
                                <div key={idx} className="flex gap-3 p-3 bg-white border border-gray-100 rounded-lg">
                                    <div className={`w-2 h-2 rounded-full ${a.color} mt-2 flex-shrink-0`} />
                                    <div className="flex-1">
                                        <p className="text-[#2C3E50] font-medium text-sm">{a.text}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{a.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── 하단: 프로필 설정 (편집) ── */}
                    <div className="border-t border-gray-100 pt-6 space-y-4">
                        <h3 className="font-bold text-[#2C3E50]">프로필 설정</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">프로필 사진</label>
                            <button disabled className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed text-sm">사진 변경 (준비 중)</button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">닉네임</label>
                            <div className="flex gap-2">
                                <input value={nickname} onChange={(e) => { setNickname(e.target.value); setNicknameError(""); }}
                                       className={`flex-1 px-3 py-2 border rounded-lg outline-none focus:border-[#5CC87A] ${nicknameError ? "border-red-400" : "border-gray-200"}`} />
                                <button onClick={saveNickname} disabled={!!nicknameError}
                                        className="px-4 py-2 bg-[#5CC87A] hover:bg-[#2E8B4F] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-sm">저장</button>
                            </div>
                            {/* h-4 = 메시지 유무와 무관하게 항상 이 높이 → 아래 개체 안 밀림 */}
                            <p className="text-xs text-red-500 h-4 mt-1">{nicknameError}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">상태메시지</label>
                            <div className="flex gap-2">
                                <input value={statusMessage} onChange={(e) => setStatusMessage(e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#5CC87A]" />
                                <button onClick={saveStatus} className="px-4 py-2 bg-[#5CC87A] hover:bg-[#2E8B4F] text-white rounded-lg text-sm">저장</button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">부서</label>
                                    <input value={dept} onChange={(e) => setDept(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#5CC87A]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">직급</label>
                                    <input value={position} onChange={(e) => setPosition(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#5CC87A]" />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button onClick={saveDeptPosition} className="px-4 py-2 bg-[#5CC87A] hover:bg-[#2E8B4F] text-white rounded-lg text-sm">부서·직급 저장</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BigModal>
    );
}
