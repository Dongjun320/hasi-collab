import { useEffect, useState, ReactNode } from "react";
import { X } from "lucide-react";
import { BigModal } from "./BigModal";
import { useUiStore } from "../store/uiStore";
import { api } from "../api/client";
import { toast } from "../store/toastStore";
import { oauthAuthorizeUrl } from "../api/urls";

// 백엔드 SocialAccountResponse.provider enum과 1:1 (google | line | amazon | twitter)
// X = twitter registrationId. 현재 백엔드는 google만 등록됨 — 나머지 3개는 registration 추가 후 동작(상현님 백엔드 담당).
const PROVIDERS = [
    { key: "google",  label: "Google", bg: "bg-white border border-gray-200" },
    { key: "line",    label: "Line",   bg: "bg-[#06C755]" },
    { key: "twitter", label: "X",      bg: "bg-black" },
    { key: "amazon",  label: "Amazon", bg: "bg-[#131921]" },
] as const;

const providerLabel = (key?: string | null) =>
    PROVIDERS.find((p) => p.key === key)?.label ?? key ?? "";

export function SettingsModal() {
    const { activeModal, closeModal } = useUiStore();
    const open = activeModal === "settings";

    // ── ① 소셜 계정 연동 ──
    const [socialProvider, setSocialProvider] = useState<string | null>(null);
    const [socialBusy, setSocialBusy] = useState(false);
    const [pickerOpen, setPickerOpen] = useState(false);

    const loadSocial = async () => {
        const { data } = await api.GET("/api/auth/social");
        setSocialProvider(data?.data?.provider ?? null);
    };

    const PROVIDER_ICON: Record<string, ReactNode> = {
        google: (
            <svg viewBox="0 0 24 24" className="w-6 h-6">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
        ),
        line: (
            <svg viewBox="0 0 24 24" className="w-6 h-6">
                <path d="M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" fill="#fff"/>
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.282.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.348 0 .63.285.63.63v4.141h1.754c.345 0 .627.283.627.63 0 .344-.282.629-.627.629" fill="#06C755"/>
            </svg>
        ),
        twitter: (
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#fff">
                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
            </svg>
        ),
        amazon: (
            <svg viewBox="0 0 512 512" className="w-6 h-6">
                <path d="M301.3 216.3c0 26.4.7 48.4-12.7 71.8-10.8 19.1-27.8 30.8-46.9 30.8-26 0-41.2-19.8-41.2-49.1 0-57.7 51.7-68.2 100.7-68.2v14.7zm68.3 165.1c-4.5 4-11 4.3-16 1.6-22.5-18.7-26.5-27.3-38.9-45.2-37.2 37.9-63.4 49.3-111.7 49.3-57 0-101.4-35.2-101.4-105.6 0-55 29.8-92.4 72.2-110.7 36.8-16.2 88.1-19.1 127.4-23.5v-8.8c0-16.1 1.2-35.2-8.2-49.1-8.3-12.5-24.1-17.6-38-17.6-25.8 0-48.9 13.2-54.5 40.7-1.1 6.1-5.6 12.1-11.7 12.4l-65.7-7c-5.5-1.2-11.6-5.7-10.1-14.2C128.2 24 200.1 0 264.5 0c33 0 76 8.8 102 33.7 33 30.8 29.8 71.8 29.8 116.5v105.6c0 31.7 13.1 45.6 25.5 62.8 4.4 6.1 5.3 13.4-.2 18-13.8 11.5-38.4 33-51.9 45z" fill="#fff" fillRule="evenodd" clipRule="evenodd"/>
                <path d="M443.4 421.5C232.1 522 100.9 437.9 16.9 386.8c-5.2-3.2-14 .8-6.4 9.6C38.6 430.3 130.2 512 249.9 512s191-65.3 199.9-76.7c8.8-11.3 2.5-17.6-6.4-13.8m59.3-32.8c-5.7-7.4-34.5-8.8-52.7-6.5-18.2 2.2-45.5 13.3-43.1 19.9 1.2 2.5 3.7 1.4 16.2.3 12.5-1.2 47.6-5.7 54.9 3.9s-11.2 55.4-14.6 62.8c-3.3 7.4 1.2 9.3 7.4 4.4 6.1-4.9 17-17.7 24.4-35.7 7.4-18.2 11.8-43.5 7.5-49.1" fill="#f90"/>
            </svg>
        ),
    };

    // 설정창 열릴 때 연동 상태 조회
    useEffect(() => {
        if (open) loadSocial();
    }, [open]);

    const handleSocialLink = (provider: string) => {
        const w = 500, h = 650;
        const left = window.screenX + (window.outerWidth - w) / 2;
        const top = window.screenY + (window.outerHeight - h) / 2;
        window.open(
            oauthAuthorizeUrl(provider),
            "social-link",
            `width=${w},height=${h},left=${left},top=${top}`,
        );
    };

    // 팝업(OAuth2RedirectPage)이 postMessage로 보내온 연동 결과 수신
    useEffect(() => {
        const onMessage = async (e: MessageEvent) => {
            if (e.origin !== window.location.origin) return;
            if (e.data?.type === "social-link") {
                setSocialBusy(true);
                const { error } = await api.POST("/api/auth/social/link", { body: { code: e.data.linkCode } });
                setSocialBusy(false);
                if (error) {
                    toast.error((error as any)?.error?.message ?? "연동에 실패했습니다");
                } else {
                    setPickerOpen(false);
                    await loadSocial();
                    toast.success("소셜 연동이 완료되었습니다");
                }
            } else if (e.data?.type === "social-link-error") {
                toast.error("이미 다른 계정에 연동된 소셜입니다");
            }
        };
        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    }, []);

    const handleSocialUnlink = async () => {
        setSocialBusy(true);
        const { error } = await api.DELETE("/api/auth/social", {});
        setSocialBusy(false);
        if (error) {
            toast.error((error as any)?.error?.message ?? "해제에 실패했습니다");
        } else {
            setSocialProvider(null);
            toast.info("연동을 해제했습니다");
        }
    };

    // ── ② 비밀번호 변경 ──
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [pwBusy, setPwBusy] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword) return;
        if (newPassword !== confirmPassword) {
            toast.error("새 비밀번호가 일치하지 않습니다");
            return;
        }
        setPwBusy(true);
        const { error } = await api.PATCH("/api/auth/password/change", {
            body: { currentPassword, newPassword },
        });
        setPwBusy(false);
        if (error) {
            toast.error((error as any)?.error?.message ?? "비밀번호 변경에 실패했습니다");
            return;
        }
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        toast.success("비밀번호가 변경되었습니다");
    };

    // ── ③ 알림 설정 (저장 API 없음 — 로컬 상태만) ──
    const [notifs, setNotifs] = useState({ messages: true, mentions: true, replies: false });

    // ── ④ 회원탈퇴 ──
    const [withdrawOpen, setWithdrawOpen] = useState(false);
    const handleWithdraw = () => {
        // TODO: 계정 삭제 API 생기면 연결 (현재 백엔드 미구현 — UI만)
        setWithdrawOpen(false);
        toast.error("회원탈퇴 기능은 준비 중입니다");
    };

    return (
        <BigModal open={open} onClose={closeModal} title="설정">
            <div className="max-w-xl mx-auto px-6 py-6 space-y-8">
                {/* ① 계정 연동 */}
                <section className="space-y-3">
                    <h3 className="font-bold text-[#2C3E50]">계정 연동</h3>
                    {/* 연동 전/후 상태와 무관하게 박스 높이 고정 (h-20, 세로 중앙정렬) */}
                    <div className="border border-gray-100 rounded-xl px-4 h-20 flex items-center">
                        {socialProvider ? (
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className={`w-10 h-10 rounded-full flex items-center justify-center ${PROVIDERS.find((p) => p.key === socialProvider)?.bg ?? "bg-gray-100"}`}>
                                        {PROVIDER_ICON[socialProvider!]}
                                    </span>
                                    <span className="text-[#2C3E50] font-medium">{providerLabel(socialProvider)} 연동됨</span>
                                </div>
                                <button onClick={handleSocialUnlink} disabled={socialBusy}
                                        className="px-3 py-1.5 text-sm border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-50 rounded-lg transition-all">
                                    연동 해제
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between w-full">
                                <p className="text-sm text-gray-500">아직 연동된 소셜 계정이 없습니다</p>
                                <button onClick={() => setPickerOpen(true)} disabled={socialBusy}
                                        className="px-4 py-2 bg-[#5CC87A] hover:bg-[#2E8B4F] disabled:opacity-50 text-white text-sm rounded-lg transition-all">
                                    소셜 연동하기
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* ② 비밀번호 변경 */}
                <section className="space-y-3">
                    <h3 className="font-bold text-[#2C3E50]">비밀번호 변경</h3>
                    <div className="space-y-3">
                        <input type="password" autoComplete="new-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                               placeholder="현재 비밀번호"
                               className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#5CC87A]" />
                        <input type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                               placeholder="새 비밀번호"
                               className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#5CC87A]" />
                        <input type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                               placeholder="새 비밀번호 확인"
                               className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#5CC87A]" />
                        <div className="flex justify-end">
                            <button onClick={handleChangePassword} disabled={pwBusy || !currentPassword || !newPassword}
                                    className="px-4 py-2 bg-[#5CC87A] hover:bg-[#2E8B4F] disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm rounded-lg transition-all">
                                변경
                            </button>
                        </div>
                    </div>
                </section>

                {/* ③ 알림 설정 (로컬만) */}
                <section className="space-y-3">
                    <h3 className="font-bold text-[#2C3E50]">알림 설정</h3>
                    <div className="space-y-3">
                        {([
                            { key: "messages", title: "모든 메시지", desc: "새 메시지를 받으면 알림" },
                            { key: "mentions", title: "멘션", desc: "나를 언급하면 알림" },
                            { key: "replies", title: "답글", desc: "내 메시지에 답글이 달리면 알림" },
                        ] as const).map((row) => (
                            <div key={row.key} className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-[#2C3E50] text-sm">{row.title}</p>
                                    <p className="text-xs text-gray-500">{row.desc}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={notifs[row.key]}
                                           onChange={(e) => setNotifs((p) => ({ ...p, [row.key]: e.target.checked }))}
                                           className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5CC87A]" />
                                </label>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ④ 회원탈퇴 */}
                <section className="border-t border-gray-100 pt-6">
                    <button onClick={() => setWithdrawOpen(true)}
                            className="text-sm text-red-500 hover:text-red-600 hover:underline transition-all">
                        회원탈퇴
                    </button>
                </section>
            </div>

            {/* 소셜 4개 선택 — 작은 중첩 모달 (바깥 클릭으로 닫히지 않음, X 버튼만) */}
            {pickerOpen && (
                <div className="fixed inset-0 z-[110] bg-black/40 flex items-center justify-center p-4">
                    <div className="relative bg-white w-full max-w-xs rounded-2xl p-6 shadow-2xl">
                        <button onClick={() => setPickerOpen(false)} title="닫기"
                                className="absolute top-3 right-3 p-1.5 hover:bg-gray-100 rounded-lg transition-all">
                            <X size={18} className="text-gray-400" />
                        </button>
                        <h4 className="font-bold text-[#2C3E50] text-center mb-5">소셜 계정 연동</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {PROVIDERS.map((p) => (
                                <button key={p.key} onClick={() => handleSocialLink(p.key)} disabled={socialBusy}
                                        className="flex flex-col items-center gap-2 p-4 border border-gray-100 rounded-xl hover:bg-[#f0f9f4] disabled:opacity-50 transition-all">
                                    <span className={`w-12 h-12 rounded-full flex items-center justify-center ${p.bg}`}>
                                    {PROVIDER_ICON[p.key]}
                                    </span>
                                    <span className="text-sm text-[#2C3E50]">{p.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 회원탈퇴 확인 — 작은 중첩 모달 */}
            {withdrawOpen && (
                <div className="fixed inset-0 z-[110] bg-black/40 flex items-center justify-center p-4"
                     onClick={() => setWithdrawOpen(false)}>
                    <div className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-2xl"
                         onClick={(e) => e.stopPropagation()}>
                        <h4 className="font-bold text-[#2C3E50] mb-2">회원탈퇴</h4>
                        <p className="text-sm text-gray-500 mb-5">정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setWithdrawOpen(false)}
                                    className="px-4 py-2 text-sm border border-gray-200 hover:bg-gray-50 rounded-lg transition-all">
                                취소
                            </button>
                            <button onClick={handleWithdraw}
                                    className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all">
                                탈퇴
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </BigModal>
    );
}
