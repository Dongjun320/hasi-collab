// src/components/common/Spinner.tsx


interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

const Spinner = ({ size = "md", fullScreen = false }: SpinnerProps) => {
  // 크기별 Tailwind 클래스 매핑
  const sizeStyles = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-[3px]",
    lg: "w-12 h-12 border-4",
  };

  // 뱅글뱅글 도는 원형 UI
  const spinnerContent = (
    <div 
      className={`border-gray-200 border-t-blue-500 rounded-full animate-spin ${sizeStyles[size]}`}
    ></div>
  );

  // fullScreen이 true면 화면 전체를 반투명하게 덮음
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
        {spinnerContent}
      </div>
    );
  }

  // 기본적으로는 컴포넌트 크기만큼만 차지
  return spinnerContent;
};

export default Spinner;