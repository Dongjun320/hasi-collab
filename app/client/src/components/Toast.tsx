// src/components/common/Toast.tsx
import { useEffect } from 'react';

type ToastPosition = "bottom-right" | "bottom-left" | "top-right" | "top-left";

interface ToastProps {
    message: string;
    isOpen: boolean;
    onClose: () => void;
    type?: "success" | "error" | "info" | "warning";
    duration?: number; // 밀리초 단위 (기본값 3초)
    position?: ToastPosition;
}

const Toast = ({
                   message,
                   isOpen,
                   onClose,
                   type = "info",
                   duration = 3000,
                   position = "bottom-right"
               }: ToastProps) => {

    // isOpen이 true가 되면 타이머를 시작해서 duration 이후에 자동으로 onClose 실행
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer); // 컴포넌트 언마운트 시 타이머 정리
        }
    }, [isOpen, onClose, duration]);

    if (!isOpen) return null;

    // 타입별 좌측 테두리 색상 및 아이콘 역할
    const typeStyles = {
        success: "border-l-4 border-green-400",
        error:   "border-l-4 border-red-400",
        warning: "border-l-4 border-yellow-400",
        info:    "border-l-4 border-blue-400",
    };

    // ✅ bottom 위치를 bottom-6 에서 bottom-24 로 상향 조정
    const positionStyles: Record<ToastPosition, string> = {
        "bottom-right": "bottom-24 right-6",
        "bottom-left":  "bottom-24 left-6",
        "top-right":    "top-6 right-6",
        "top-left":     "top-6 left-6",
    };

    return (
        <div className={`fixed ${positionStyles[position]} z-[100] animate-fadeInUp`}>
            <div className={`bg-[#1e1e1e] text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 min-w-[280px] ${typeStyles[type]}`}>
                <span className="font-medium text-sm flex-1">{message}</span>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

export default Toast;