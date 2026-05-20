import { ChangeEvent } from 'react';

// 가이드 문서에 정의된 InputProps 인터페이스 적용
interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void; // ✅ React.ChangeEvent -> ChangeEvent로 수정
  disabled?: boolean;
  error?: string;
}

const Input = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  disabled = false,
  error,
}: InputProps) => {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 
          ${error ? "border-red-400" : "border-gray-300"} 
          ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

export default Input;