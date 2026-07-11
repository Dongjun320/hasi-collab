import { useEffect, useState } from "react"
import LoadingScreenLime from "./LoadingScreenLime";

interface Props {
    onFinish: () => void
}

const POPUP_CSS = `
    @keyframes popup-slide-up {
        from { transform: translateY(40px) scale(0.95); opacity: 0; }
        to { transform: translateY(0) scale(1); opacity: 1; }
        }
    .popup-slide-up {
        animation: popup-slide-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
    @keyframes overlay-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
        }
    .overlay-fade-in {
        animation: overlay-fade-in 0.3s ease-in-out forwards;
        }
`

export default function LoadingPopup({ onFinish }: Props) {
    const [visible, setVisible] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false)
            onFinish()
        }, 3500)
        return () => clearTimeout(timer)
    }, [onFinish])

    if (!visible) return null
    
    return (
        <>
            <style>{POPUP_CSS}</style>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overlay-fade-in">
                <div
                    className="popup-scale-in rounded-2xl overflow-hidden shadow-2xl"
                    style={{ width: 480, height: 320 }}
                >
                   <LoadingScreenLime />
                </div>
            </div>
        </>
    )
}