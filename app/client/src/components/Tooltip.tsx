import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type TooltipSide = "top" | "bottom" | "left" | "right";
type TooltipAlign = "center" | "start" | "end";

interface TooltipProps {
    label: string;
    side?: TooltipSide;
    /** 화면 가장자리 버튼용 — 툴팁을 시작/끝에 맞춰 정렬 (top/bottom에서만 유효) */
    align?: TooltipAlign;
    children: ReactNode;
}

const GAP = 10;

/**
 * 커스텀 툴팁.
 * body에 portal로 띄우고 position:fixed를 쓰기 때문에
 * 조상의 overflow-hidden / overflow-auto 에 잘리지 않는다.
 * (서버 레일처럼 스크롤 영역 안에 있는 버튼도 정상 표시)
 *
 * 감쌀 버튼에서 title 속성은 제거할 것 — 브라우저 기본 툴팁과 중복됨
 */
export function Tooltip({ label, side = "top", align = "center", children }: TooltipProps) {
    const [rect, setRect] = useState<DOMRect | null>(null);

    // 앵커 위치로부터 고정 좌표 + transform 계산 (별도 측정 없이 1패스로 배치)
    const place = (r: DOMRect) => {
        if (side === "left")  return { left: r.left - GAP,   top: r.top + r.height / 2, transform: "translate(-100%, -50%)" };
        if (side === "right") return { left: r.right + GAP,  top: r.top + r.height / 2, transform: "translate(0, -50%)" };

        const top = side === "top" ? r.top - GAP : r.bottom + GAP;
        const y   = side === "top" ? "-100%" : "0";

        if (align === "start") return { left: r.left,  top, transform: `translate(0, ${y})` };
        if (align === "end")   return { left: r.right, top, transform: `translate(-100%, ${y})` };
        return { left: r.left + r.width / 2, top, transform: `translate(-50%, ${y})` };
    };

    return (
        <>
            <div
                className="relative inline-flex items-center"
                onMouseEnter={(e) => setRect(e.currentTarget.getBoundingClientRect())}
                onMouseLeave={() => setRect(null)}
            >
                {children}
            </div>

            {rect && createPortal(
                <div
                    style={{ position: "fixed", ...place(rect) }}
                    className="bg-[#1e3a28] text-white text-xs font-semibold px-3 py-1.5 rounded-lg
                        pointer-events-none whitespace-nowrap z-[9999] shadow-xl"
                >
                    {label}
                </div>,
                document.body
            )}
        </>
    );
}
