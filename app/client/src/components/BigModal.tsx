import { useEffect } from "react";
import { X } from "lucide-react";

interface Props { open: boolean; onClose: () => void; title: string; children: React.ReactNode; }

export function BigModal({ open, onClose, title, children}: Props) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;
    return (// 배경에 onClick 없음 = 바깥 클릭해도 안 닫힘
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                <div className="h-14 px-6 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
                    <h1 className="text-lg font-bold text-[#2C3E50]">{title}</h1>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-400" /></button>
                </div>
                <div className="flex-1 overflow-y-auto">{children}</div>
            </div>
        </div>
    );
}