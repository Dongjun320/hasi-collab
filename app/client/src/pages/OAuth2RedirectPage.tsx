import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OAuth2RedirectPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (token) {
            localStorage.setItem("hasi-auth", JSON.stringify({state: {accessToken: token}}))
            navigate("/WorkspaceHome", { replace: true })
            return
        }
        navigate("/", { replace: true })
}, [])

    return<div>ログイン処理中...</div>
}

export default OAuth2RedirectPage;