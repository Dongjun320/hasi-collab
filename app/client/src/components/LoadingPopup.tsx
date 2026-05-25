import { useEffect, useState } from "react"
import LoadingScreenLime from "./LoadingScreenLime";
import LoadingScreenWhite from "./LoadingScreenWhite";

interface Props {
    onFinish: () => void
}

const POPUP_CSS = `
    @keyframes popup-scale-in {
        from { transform: scle(0,1); opacity 0; }
        tp {transform: scale(1); opacity 1; }
        }
    .popup-scale-in {
        animation: popup-scale-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div
                    className="popup-scale-in rounded-2xl overflow-hidden shadow-2xl"
                    style={{ width: 480, height: 320 }}
                >
                   <LoadingScreenWhite />
                </div>
            </div>
        </>
    )
}