import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { BigModal } from "./BigModal";
import { useUiStore } from "../store/uiStore";
import { api } from "../api/client";
import { useAuthStore } from "../store/authStore";
import { useMemberStore } from "../store/memberStore";
import { toast } from "../store/toastStore";

// 아바타 업로드/삭제는 openapi 스펙에 없어 타입드 api 대신 plain fetch 사용
// (messenger.ts와 동일 패턴). 개발은 vite 프록시(/api→service), 배포는 VITE_API_BASE_URL.
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export function ProfileModal() {
    const { activeModal, closeModal } = useUiStore();
    const { t } = useTranslation();
    const open = activeModal === "profile";

    const [me, setMe] = useState<any>(null);
    const [nickname, setNickname] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [dept, setDept] = useState("");
    const [position, setPosition] = useState("");

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
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarBusy, setAvatarBusy] = useState(false);

    // 프로필 사진 업로드 (multipart) — 성공 시 me.avatarUrl 갱신
    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";   // 같은 파일 재선택 가능하도록 초기화
        if (!file) return;
        if (!file.type.startsWith("image/")) { toast.error(t("profile.toastImageOnly")); return; }
        if (file.size > 5 * 1024 * 1024) { toast.error(t("profile.toastMaxSize")); return; }

        setAvatarBusy(true);
        try {
            const token = useAuthStore.getState().accessToken;
            const form = new FormData();
            form.append("file", file);
            const res = await fetch(`${API_BASE}/api/users/me/avatar`, {
                method: "POST",
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                body: form,
            });
            if (!res.ok) throw new Error(String(res.status));
            const url = (await res.text()).trim();
            setMe((p: any) => ({ ...p, avatarUrl: url }));
            toast.success(t("profile.toastAvatarChanged"));
        } catch (err) {
            console.error("아바타 업로드 실패:", err);
            toast.error(t("profile.toastAvatarChangeFailed"));
        } finally {
            setAvatarBusy(false);
        }
    };

    // 프로필 사진 삭제
    const handleAvatarDelete = async () => {
        setAvatarBusy(true);
        try {
            const token = useAuthStore.getState().accessToken;
            const res = await fetch(`${API_BASE}/api/users/me/avatar/delete`, {
                method: "DELETE",
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            if (!res.ok) throw new Error(String(res.status));
            setMe((p: any) => ({ ...p, avatarUrl: null }));
            toast.success(t("profile.toastAvatarDeleted"));
        } catch (err) {
            console.error("아바타 삭제 실패:", err);
            toast.error(t("profile.toastAvatarDeleteFailed"));
        } finally {
            setAvatarBusy(false);
        }
    };

    const saveNickname = async () => {
        const trimmed = nickname.trim();
        if (!trimmed || trimmed === me?.nickname) return;   // 변경 없음

        // 저장 시점에 중복검사
        const { data, error: searchErr } = await api.GET("/api/users/search", { params: { query: { nickname: trimmed } } });
        if (!searchErr && data?.uid && data.uid !== myUid && data.nickname === trimmed) {
            setNicknameError(t("errors.USER_002"));
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
        <BigModal open={open} onClose={closeModal} title={t("profile.title")}>
            <div className="max-w-xl mx-auto">
                {/* 고정: 프로필 보기 (스크롤해도 상단에 고정) */}
                <div className="sticky top-0 bg-white z-10 px-6 pt-6 pb-4 border-b border-gray-100 relative">
                    {/* 사진 변경 — 상단 우측 고정 영역 */}
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    <div className="absolute top-5 right-6 flex gap-2">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={avatarBusy}
                            className="px-3 py-1.5 text-xs bg-[#5CC87A] hover:bg-[#2E8B4F] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-all"
                        >
                            {avatarBusy ? t("profile.processing") : t("profile.changePhoto")}
                        </button>
                        {me?.avatarUrl && (
                            <button
                                onClick={handleAvatarDelete}
                                disabled={avatarBusy}
                                className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-600 rounded-lg transition-all"
                            >
                                {t("common.delete")}
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-5">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#A8E6B8] to-[#5CC87A] flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 overflow-hidden">
                            {me?.avatarUrl
                                ? <img src={me.avatarUrl} alt={t("profile.photoAlt")} className="w-full h-full object-cover" />
                                : (me?.nickname?.charAt(0) || t("profile.meInitial"))}
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-xl font-bold text-[#2C3E50]">{me?.nickname || "-"}</h2>
                            <p className="text-sm text-gray-500 mt-0.5">{me?.statusMessage || t("profile.noStatus")}</p>
                            <p className="text-xs text-gray-400 mt-1">{me?.department || t("profile.noDept")} · {me?.position || t("profile.noPosition")}</p>
                        </div>
                    </div>

                    <div className="space-y-2 mt-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">{t("profile.email")}</span>
                            <span className="text-[#2C3E50] font-medium">{me?.email ?? "-"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">{t("profile.joinDate")}</span>
                            <span className="text-[#2C3E50] font-medium">{me?.createdAt?.slice(0, 10) ?? "-"}</span>
                        </div>
                    </div>
                </div>

                {/* 스크롤: 프로필 설정 */}
                <div className="px-6 py-6 space-y-6">
                    {/* ── 프로필 설정 (편집) ── */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-[#2C3E50]">{t("profile.settings")}</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t("profile.nickname")}</label>
                            <div className="flex gap-2">
                                <input value={nickname} onChange={(e) => { setNickname(e.target.value); setNicknameError(""); }}
                                       className={`flex-1 px-3 py-2 border rounded-lg outline-none focus:border-[#5CC87A] ${nicknameError ? "border-red-400" : "border-gray-200"}`} />
                                <button onClick={saveNickname} disabled={!!nicknameError}
                                        className="px-4 py-2 bg-[#5CC87A] hover:bg-[#2E8B4F] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-sm">{t("common.save")}</button>
                            </div>
                            {/* h-4 = 메시지 유무와 무관하게 항상 이 높이 → 아래 개체 안 밀림 */}
                            <p className="text-xs text-red-500 h-4 mt-1">{nicknameError}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t("profile.statusMessage")}</label>
                            <div className="flex gap-2">
                                <input value={statusMessage} onChange={(e) => setStatusMessage(e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#5CC87A]" />
                                <button onClick={saveStatus} className="px-4 py-2 bg-[#5CC87A] hover:bg-[#2E8B4F] text-white rounded-lg text-sm">{t("common.save")}</button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t("profile.dept")}</label>
                                    <input value={dept} onChange={(e) => setDept(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#5CC87A]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t("profile.position")}</label>
                                    <input value={position} onChange={(e) => setPosition(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#5CC87A]" />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button onClick={saveDeptPosition} className="px-4 py-2 bg-[#5CC87A] hover:bg-[#2E8B4F] text-white rounded-lg text-sm">{t("profile.saveDeptPosition")}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BigModal>
    );
}
