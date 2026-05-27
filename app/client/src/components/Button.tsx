import { ReactNode } from 'react';

// 가이드 문서에 정의된 ButtonProps 인터페이스 적용
interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "danger" | "ghost";
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}

const Button = ({
  children,
  variant = "primary",
  disabled = false,
  onClick,
  type = "button",
}: ButtonProps) => {
  const variantStyles = {
    primary: "bg-emerald-400 text-white hover:bg-emerald-400",
    danger:  "bg-red-500 text-white hover:bg-red-600",
    ghost:   "bg-gray-100 text-gray-700 hover:bg-gray-200",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded font-medium text-sm transition-colors ${variantStyles[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {children}
    </button>
  );
};

export default Button;