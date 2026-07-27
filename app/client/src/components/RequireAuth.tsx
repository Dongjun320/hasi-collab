import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export function RequireAuth({ children }: { children: JSX.Element }) {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // 서버 에러나 네트워크 단절 상태를 관리하기 위한 state 추가
    const [isNetworkError, setIsNetworkError] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data, error, response } = await api.GET('/api/users/me');

                if (error) {
                    // 💡 실제 인증 실패(401)인 경우에만 로그인 화면으로 쫓아냄
                    if (response?.status === 401 || (error as any)?.code === 'AUTH_001') {
                        navigate('/');
                    } else {
                        // 500 에러 등 서버 자체 문제일 경우 튕겨내지 않음
                        setIsNetworkError(true);
                    }
                } else if (data) {
                    setIsAuthenticated(true);
                } else {
                    navigate('/');
                }
            } catch (e) {
                // 💡 API 서버가 완전히 내려갔거나 클라이언트 인터넷이 끊겨서
                // 아예 fetch 자체가 실패하여 catch 블록으로 빠진 경우
                console.error("Network or server down:", e);
                setIsNetworkError(true); // 로그인으로 튕겨내지 않음
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [navigate]);

    if (isLoading) {
        return <div className="h-screen flex items-center justify-center">Loading...</div>;
    }

    // 💡 서버가 다운된 경우 유저를 강제 로그아웃 시키지 않고 안내 화면을 띄움
    if (isNetworkError) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-[#f8fdf9]">
                <h2 className="text-xl font-bold text-[#2C3E50]">서버와 연결할 수 없습니다</h2>
                <p className="text-sm text-gray-500 mt-2">일시적인 네트워크 오류이거나 서버 점검 중입니다.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-5 px-5 py-2 bg-[#5CC87A] hover:bg-[#2E8B4F] text-white rounded-lg transition-colors"
                >
                    다시 시도
                </button>
            </div>
        );
    }

    return isAuthenticated ? children : null;
}