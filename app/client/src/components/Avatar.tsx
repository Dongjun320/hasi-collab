// src/components/common/Avatar.tsx
import React from 'react';

interface AvatarProps {
  src?: string; // 이미지가 없을 수도 있으니 ?(선택) 처리
  name: string; // 이니셜을 추출하기 위해 필수
  size?: "sm" | "md" | "lg";
}

const Avatar = ({ src, name, size = "md" }: AvatarProps) => {
  // 사이즈별 크기 매핑
  const sizeStyles = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-lg",
  };

  // 이름에서 첫 글자만 추출 (이니셜용)
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className={`flex items-center justify-center rounded-full font-bold shadow-inner overflow-hidden ${sizeStyles[size]}`}>
      {src ? (
        <img src={src} alt={`${name}의 프로필`} className="w-full h-full object-cover" />
      ) : (
        // 이미지가 없을 때 보여줄 기본 배경 (가이드 문서의 그라데이션 스타일 활용)
        <div className="w-full h-full bg-gradient-to-tr from-blue-400 to-purple-500 flex items-center justify-center text-white">
          {initial}
        </div>
      )}
    </div>
  );
};

export default Avatar;