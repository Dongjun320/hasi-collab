import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export function RequireAuth({ children }: { children: JSX.Element }) {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data, error } = await api.GET('/api/users/me');

                // 에러가 발생했거나(401 등) 데이터가 없으면 로그인 창으로 리다이렉트
                if (error || !data) {
                    navigate('/');
                } else {
                    setIsAuthenticated(true);
                }
            } catch (error) {
                navigate('/');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [navigate]);

    if (isLoading) {
        // API 응답 대기 중 보여줄 화면 (스피너 컴포넌트로 교체 가능)
        return <div className="h-screen flex items-center justify-center">Loading...</div>;
    }

    // 인증이 완료된 경우에만 하위 라우트(children)를 렌더링
    return isAuthenticated ? children : null;
}