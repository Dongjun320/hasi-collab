import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
      // 배경 영역에 animate-modal-overlay 적용
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 animate-modal-overlay">

        {/* 모달창 영역에 animate-modal-pop-in 적용 */}
        <div
            className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl animate-modal-pop-in"
            onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            {title && <h2 className="text-lg font-bold text-gray-800">{title}</h2>}
            <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 text-xl font-bold"
            >
              ✕
            </button>
          </div>

          <div>{children}</div>
        </div>

      </div>
  );
};

export default Modal;