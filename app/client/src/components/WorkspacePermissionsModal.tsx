// "권한 설정" 독립 모달 — 오너만 사용.
// 3열(Owner/Admin/Member) 매트릭스지만, 백엔드가 저장하는 건 Admin 열(adminAllowed)뿐이다.
//   - Owner : 항상 전체 허용 (표시 전용, 비활성)
//   - Admin : adminAllowed 플래그 (편집 가능 → PATCH 저장)
//   - Member: 항상 불가 (표시 전용, 비활성)
// GET/PATCH /api/workspaces/{id}/permissions 는 오너 전용이라, 이 모달도 오너에게만 연다.

import { useEffect, useState } from "react";
import { api } from "../api/client";
import { toast } from "../store/toastStore";

type PermKey =
    | "EDIT_WORKSPACE" | "DELETE_WORKSPACE"
    | "INVITE_WORKSPACE_MEMBER" | "REMOVE_WORKSPACE_MEMBER" | "EDIT_WORKSPACE_MEMBER_ROLE"
    | "CREATE_CHANNEL" | "EDIT_CHANNEL" | "DELETE_CHANNEL"
    | "INVITE_CHANNEL_MEMBER" | "REMOVE_CHANNEL_MEMBER" | "EDIT_CHANNEL_MEMBER_ROLE";

const PERMISSION_GROUPS: { title: string; items: [PermKey, string][] }[] = [
    {
        title: "워크스페이스",
        items: [
            ["EDIT_WORKSPACE", "워크스페이스 설정 수정"],
            ["DELETE_WORKSPACE", "워크스페이스 삭제"],
        ],
    },
    {
        title: "멤버 관리",
        items: [
            ["INVITE_WORKSPACE_MEMBER", "워크스페이스 초대"],
            ["REMOVE_WORKSPACE_MEMBER", "워크스페이스 추방"],
            ["EDIT_WORKSPACE_MEMBER_ROLE", "멤버 역할 수정"],
        ],
    },
    {
        title: "채널",
        items: [
            ["CREATE_CHANNEL", "채널 생성"],
            ["EDIT_CHANNEL", "채널 설정 수정"],
            ["DELETE_CHANNEL", "채널 삭제"],
            ["INVITE_CHANNEL_MEMBER", "채널 초대"],
            ["REMOVE_CHANNEL_MEMBER", "채널 추방"],
            ["EDIT_CHANNEL_MEMBER_ROLE", "채널 멤버 역할 수정"],
        ],
    },
];

interface Props {
    isOpen: boolean;
    onClose: () => void;
    workspaceId: number;
}

export function WorkspacePermissionsModal({ isOpen, onClose, workspaceId }: Props) {
    const [flags, setFlags] = useState<Partial<Record<PermKey, boolean>>>({});
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        let alive = true;
        setLoading(true);
        setLoadError(false);
        (async () => {
            const { data, error } = await api.GET("/api/workspaces/{workspaceId}/permissions", {
                params: { path: { workspaceId } },
            });
            if (!alive) return;
            setLoading(false);
            if (error || !data?.success) { setLoadError(true); return; }
            const map: Partial<Record<PermKey, boolean>> = {};
            (data.data ?? []).forEach((p) => {
                if (p.permission) map[p.permission as PermKey] = !!p.adminAllowed;
            });
            setFlags(map);
        })();
        return () => { alive = false; };
    }, [isOpen, workspaceId]);

    const toggle = (key: PermKey) => setFlags((f) => ({ ...f, [key]: !f[key] }));

    const save = async () => {
        setSaving(true);
        const permissions = PERMISSION_GROUPS.flatMap((g) =>
            g.items.map(([key]) => ({ permission: key, adminAllowed: !!flags[key] }))
        );
        const { error } = await api.PATCH("/api/workspaces/{workspaceId}/permissions", {
            params: { path: { workspaceId } },
            body: { permissions },
        });
        setSaving(false);
        if (error) { toast.error("권한 저장에 실패했습니다"); return; }
        toast.success("권한을 저장했습니다");
        onClose();
    };

    if (!isOpen) return null;

    // 열 너비 통일용 (헤더/각 행 동일 클래스)
    const col = "w-20 text-center flex-shrink-0";

    return (
        <div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60] animate-modal-overlay"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[85vh] flex flex-col animate-modal-pop-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800">권한 설정</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
                </div>

                {/* 본문 */}
                <div className="px-6 py-4 overflow-y-auto">
                    {loading && <p className="text-sm text-gray-400 py-8 text-center">불러오는 중…</p>}
                    {loadError && <p className="text-sm text-red-500 py-8 text-center">권한을 불러오지 못했습니다.</p>}

                    {!loading && !loadError && (
                        <>
                            {/* 열 헤더 */}
                            <div className="flex items-center pb-2 border-b border-gray-100 text-xs text-gray-400">
                                <span className="flex-1">권한</span>
                                <span className={col}>Owner</span>
                                <span className={`${col} font-bold text-gray-700`}>Admin</span>
                                <span className={col}>Member</span>
                            </div>

                            {PERMISSION_GROUPS.map((group) => (
                                <div key={group.title} className="pt-3">
                                    <p className="text-sm text-gray-400 mb-1">{group.title}</p>
                                    {group.items.map(([key, label]) => (
                                        <div key={key} className="flex items-center py-2 border-b border-gray-50 last:border-0">
                                            <span className="flex-1 text-sm text-[#2C3E50]">{label}</span>
                                            {/* Owner: 항상 허용 (읽기 전용) */}
                                            <span className={col}>
                                                <input type="checkbox" checked disabled className="accent-[#5CC87A] cursor-not-allowed opacity-60" />
                                            </span>
                                            {/* Admin: 편집 가능 */}
                                            <span className={col}>
                                                <input
                                                    type="checkbox"
                                                    checked={!!flags[key]}
                                                    onChange={() => toggle(key)}
                                                    aria-label={`${label} — Admin 허용`}
                                                    className="accent-[#5CC87A] cursor-pointer w-4 h-4"
                                                />
                                            </span>
                                            {/* Member: 항상 불가 (읽기 전용) */}
                                            <span className={col}>
                                                <input type="checkbox" checked={false} disabled className="cursor-not-allowed opacity-40" />
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </>
                    )}
                </div>

                {/* 푸터 */}
                <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        disabled={saving}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-600 font-medium rounded-lg text-sm"
                    >
                        취소
                    </button>
                    <button
                        onClick={save}
                        disabled={saving || loading || loadError}
                        className="px-5 py-2 bg-[#5CC87A] hover:bg-[#2E8B4F] disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium rounded-lg text-sm"
                    >
                        {saving ? "저장 중…" : "저장"}
                    </button>
                </div>
            </div>
        </div>
    );
}
