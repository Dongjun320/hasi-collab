import React from 'react';

// 가이드 문서에 정의된 BadgeProps 인터페이스 적용
interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warn" | "danger" | "default";
}

const Badge = ({ children, variant = "default" }: BadgeProps) => {
  const styles = {
    success: "bg-green-100 text-green-700",
    warn:    "bg-yellow-100 text-yellow-700",
    danger:  "bg-red-100 text-red-700",
    default: "bg-gray-100 text-gray-600",
  };

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[variant]}`}>
      {children}
    </span>
  );
};

export default Badge;