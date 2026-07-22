import type { ReactNode } from "react";

type TooltipSide = "top" | "bottom" | "left" | "right";

interface TooltipProps {
    label: string;
    side?: TooltipSide;
    /** 화면 가장자리 버튼용 — 툴팁을 왼쪽/오른쪽 끝에 맞춰 정렬 (top/bottom에서만 유효) */
    align?: "center" | "start" | "end";
    children: ReactNode;
}

const SIDE_CLASS: Record<TooltipSide, string> = {
    top:    "bottom-[calc(100%+10px)]",
    bottom: "top-[calc(100%+10px)]",
    left:   "right-[calc(100%+10px)] top-1/2 -translate-y-1/2",
    right:  "left-[calc(100%+10px)] top-1/2 -translate-y-1/2",
};

// top/bottom일 때 가로 정렬
const ALIGN_CLASS = {
    center: "left-1/2 -translate-x-1/2",
    start:  "left-0",
    end:    "right-0",
} as const;

/**
 * 커스텀 툴팁. 감쌀 버튼에서 title 속성은 제거할 것 (기본 툴팁과 중복됨)
 * 주의: 조상에 overflow-hidden이 있으면 잘림
 */
export function Tooltip({ label, side = "top", align = "center", children }: TooltipProps) {
    const isVertical = side === "top" || side === "bottom";

    return (
        <div className="relative group flex items-center">
            {children}
            <div
                className={`absolute ${SIDE_CLASS[side]} ${isVertical ? ALIGN_CLASS[align] : ""}
                    bg-[#1e3a28] text-white text-xs font-semibold px-3 py-1.5 rounded-lg
                    opacity-0 group-hover:opacity-100 transition-opacity
                    pointer-events-none whitespace-nowrap z-50 shadow-xl`}
            >
                {label}
            </div>
        </div>
    );
}