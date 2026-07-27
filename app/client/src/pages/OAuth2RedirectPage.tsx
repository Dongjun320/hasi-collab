import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuthStore } from "../store/authStore";
import { connectStomp } from "../api/stomp";

const OAuth2RedirectPage = () => {
    const navigate = useNavigate();
    const setAuth = useAuthStore((s) => s.setAuth);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const refreshToken = params.get("refreshToken");
        const linkCode = params.get("linkCode");

        // 팝업(연동)에서 열렸으면 결과만 부모창으로 넘기고 닫는다.
        // 팝업은 부모와 localStorage를 공유 — 여기서 토큰을 저장하면 계정이 바뀐다. 절대 저장 X
        if (window.opener) {
            if (linkCode) {
                window.opener.postMessage(
                    { type: "social-link", linkCode }, window.location.origin);
            } else {
                // linkCode 없이 토큰이 왔다 = 이 소셜은 이미 다른 계정 소유
                window.opener.postMessage(
                    { type: "social-link-error" }, window.location.origin);
            }
            window.close();
            return;
        }

        // 여기부터는 일반 로그인(전체 페이지 이동)
        // 미연동 소셜로 로그인 시도 → 안내 (우하단 알림창)
        if (linkCode) {
            navigate(`/?social=unlinked&provider=${params.get("provider")}`, { replace: true });
            return;
        }

        if (!token || !refreshToken) {
            navigate("/", { replace: true });
            return;
        }

        (async () => {
            try {
                // 리다이렉트는 토큰만 주므로 사용자 정보는 따로 조회
                // (이 시점엔 localStorage가 비어 있어 client.ts 미들웨어가 헤더를 못 붙임)
                const { data, error } = await api.GET("/api/users/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (error || !data) {
                    navigate("/", { replace: true });
                    return;
                }
                setAuth(data as any, token, refreshToken);
                connectStomp(token);   // 소셜 로그인 즉시 STOMP 연결 = online
                navigate("/WorkspaceHome", { replace: true });
            } catch (e) {
                console.error("소셜 로그인 처리 실패:", e);
                navigate("/", { replace: true });
            }
        })();
    }, []);

    return <div>ログイン処理中...</div>;
};

export default OAuth2RedirectPage;