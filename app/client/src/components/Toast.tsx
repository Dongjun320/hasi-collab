// src/components/common/Toast.tsx
import { useEffect } from 'react'; //  불필요한 React 기본 임포트 제거 및 named import만 사용

interface ToastProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  type?: "success" | "error" | "info" | "warning";
  duration?: number; // 밀리초 단위 (기본값 3초)
}

const Toast = ({ 
  message, 
  isOpen, 
  onClose, 
  type = "info", 
  duration = 3000 
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

  return (
    // 임의 값(Arbitrary value) 대신 tailwind.config에 등록된 클래스명 사용
    <div className="fixed bottom-6 right-6 z-[100] animate-fadeInUp">
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