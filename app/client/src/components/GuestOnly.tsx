import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export function GuestOnly({ children }: { children: JSX.Element }) {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data, error } = await api.GET('/api/users/me');

                // 에러가 없고 유저 정보가 존재하면 이미 로그인된 유저이므로 리다이렉트
                if (!error && data) {
                    navigate('/WorkspaceHome');
                }
            } catch (error) {
                // 인증되지 않은 게스트이므로 아무 작업 없이 진행
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [navigate]);

    if (isLoading) {
        return <div className="h-screen flex items-center justify-center">Loading...</div>;
    }

    // 인증되지 않은 유저에게만 로그인 페이지(children)를 렌더링
    return children;
}