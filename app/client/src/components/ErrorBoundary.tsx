import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
    // fallback을 주면 에러 시 그걸 렌더. 안 주면 기본 진단 화면.
    // null을 주면 에러 시 아무것도 안 그림 (전역 모달처럼 죽어도 앱이 살아야 하는 곳).
    fallback?: ReactNode;
    // 로그 식별용 라벨 (예: "root", "global-modals")
    label?: string;
}

interface State {
    error: Error | null;
}

// React 렌더 에러를 잡아 트리 전체가 언마운트(흰 화면)되는 것을 막는다.
// 없으면 어디서든 렌더 에러 하나로 #root가 텅 비고 콘솔 단서도 안 남는다.
export class ErrorBoundary extends Component<Props, State> {
    state: State = { error: null };

    static getDerivedStateFromError(error: Error): State {
        return { error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        // 프로덕션 콘솔에도 최소한의 단서를 남김
        console.error(`[ErrorBoundary${this.props.label ? `:${this.props.label}` : ""}]`, error, info.componentStack);
    }

    render() {
        if (this.state.error) {
            // fallback이 명시되면(null 포함) 그대로 사용
            if (this.props.fallback !== undefined) return this.props.fallback;

            // 기본 진단 화면 (루트용)
            return (
                <div className="min-h-screen flex items-center justify-center bg-[#f0f9f4] p-6">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-[#e8f8ed] p-8 text-center">
                        <h1 className="text-lg font-bold text-[#2C3E50] mb-2">문제가 발생했어요</h1>
                        <p className="text-sm text-gray-500 mb-6">
                            화면을 그리는 중 오류가 발생했습니다. 새로고침 후에도 계속되면 관리자에게 문의해주세요.
                        </p>
                        <pre className="text-[11px] text-left text-gray-400 bg-gray-50 rounded-lg p-3 mb-6 overflow-auto max-h-40 whitespace-pre-wrap break-words">
                            {this.state.error.message || this.state.error.name || "Unknown error"}
                        </pre>
                        <button
                            onClick={() => (window.location.href = "/")}
                            className="px-4 py-2 text-sm font-semibold bg-[#5CC87A] hover:bg-[#2E8B4F] text-white rounded-lg transition-all"
                        >
                            새로고침
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
