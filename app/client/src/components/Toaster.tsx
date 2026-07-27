// PM 담당 — 전역 토스트 렌더러. App 최상위에 딱 1개만 둡니다.
// toastStore의 toasts 배열을 화면에 쌓아서 보여주고, 각자 자동으로 닫힙니다.

import Toast from './Toast'
import { useToastStore } from '../store/toastStore'

export const Toaster = () => {
  const { toasts, remove } = useToastStore()

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          isOpen={true}
          message={t.message}
          type={t.type}
          onClose={() => remove(t.id)}
        />
      ))}
    </div>
  )
}
