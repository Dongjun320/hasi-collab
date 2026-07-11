import { ReactNode } from 'react';

// 가이드 문서에 정의된 ModalProps 인터페이스 적용
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      {/* Tailwind 커스텀 애니메이션 클래스(animate-fadeInUp) 추가 */}
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl animate-fadeInUp" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          {title && <h2 className="text-lg font-bold text-gray-800">{title}</h2>}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;