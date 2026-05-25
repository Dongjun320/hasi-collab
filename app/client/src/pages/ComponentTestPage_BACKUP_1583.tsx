// 공통 컴포넌트 테스트 페이지 — 개발 확인용
import { useState } from 'react'
import Button from '../components/Button'
import Input from '../components/Input'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import Avatar from '../components/Avatar'
import Spinner from '../components/Spinner'
import Toast from '../components/Toast'

const ComponentTestPage = () => {
  // 기존 상태
  const [modalOpen, setModalOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [errorInput, setErrorInput] = useState('')

<<<<<<< HEAD
=======
  // 새로 추가된 상태
  const [spinnerFullScreen, setSpinnerFullScreen] = useState(false)
  const [toast, setToast] = useState<{ open: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({
    open: false,
    message: '',
    type: 'info',
  })

  // 풀스크린 스피너 테스트용 헬퍼 함수
  const handleFullScreenSpinner = () => {
    setSpinnerFullScreen(true)
    // 2초 후 자동으로 닫히도록 설정
    setTimeout(() => {
      setSpinnerFullScreen(false)
    }, 2000)
  }
>>>>>>> dev

  return (
    <div className="min-h-screen bg-gray-50 p-8 relative">
      <div className="max-w-2xl mx-auto">

        <h1 className="text-2xl font-bold text-gray-800 mb-2">공통 컴포넌트 테스트</h1>

        {/* ── Avatar ── */}
        <section className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
          <h2 className="text-base font-bold text-gray-700 mb-4 pb-2 border-b">Avatar</h2>
          <div className="flex flex-wrap gap-4 items-center">
            
            {/* 1. 이미지 없이 이름만 있는 경우 (기본 md 사이즈, 이니셜 표시됨) */}
            <Avatar name="Guest" />

            {/* 2. 이미지와 이름이 모두 있는 경우 */}
            <Avatar src="https://i.pravatar.cc/150?img=1" name="User 1" />

            {/* 3. 사이즈(size) 속성을 활용해본 경우 */}
            <Avatar src="https://i.pravatar.cc/150?img=3" name="User 2" size="lg" />
            <Avatar name="Admin" size="sm" />
            
          </div>
        </section>

        {/* ── Spinner ── */}
        <section className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
          <h2 className="text-base font-bold text-gray-700 mb-4 pb-2 border-b">Spinner</h2>
          <div className="flex flex-wrap gap-6 items-center">
            <div>
              <p className="text-sm text-gray-500 mb-2">기본 스피너</p>
              <Spinner />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">풀스크린 스피너 (2초 유지)</p>
              <Button onClick={handleFullScreenSpinner}>전체 화면 로딩 테스트</Button>
            </div>
          </div>
        </section>

        {/* ── Toast ── */}
        <section className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
          <h2 className="text-base font-bold text-gray-700 mb-4 pb-2 border-b">Toast</h2>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => setToast({ open: true, message: '성공적으로 저장되었습니다!', type: 'success' })}
            >
              Success 토스트
            </Button>
            <Button 
              variant="danger" 
              onClick={() => setToast({ open: true, message: '오류가 발생했습니다.', type: 'error' })}
            >
              Error 토스트
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setToast({ open: true, message: '새로운 알림이 있습니다.', type: 'info' })}
            >
              Info 토스트
            </Button>
            <Button 
              onClick={() => setToast({ open: true, message: '네트워크 연결이 불안정합니다.', type: 'warning' })}
            >
              Warning 토스트
            </Button>
          </div>
        </section>

        {/* ── Button ── */}
        <section className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
          <h2 className="text-base font-bold text-gray-700 mb-4 pb-2 border-b">Button</h2>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => alert('primary 클릭!')}>primary (기본)</Button>
            <Button variant="danger" onClick={() => alert('danger 클릭!')}>danger (삭제)</Button>
            <Button variant="ghost" onClick={() => alert('ghost 클릭!')}>ghost (취소)</Button>
            <Button disabled>disabled (비활성)</Button>
            <Button type="submit" onClick={() => alert('submit!')}>submit 타입</Button>
          </div>
        </section>

        {/* ── Input ── */}
        <section className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
          <h2 className="text-base font-bold text-gray-700 mb-4 pb-2 border-b">Input</h2>
          <div className="flex flex-col gap-4">
            <Input placeholder="라벨 없는 기본 입력창" />
            <Input label="이메일" type="email" placeholder="user@example.com" />
            <Input label="비밀번호" type="password" placeholder="••••••••" />
            <Input
              label="입력값 확인 (실시간)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="타이핑해보세요"
            />
            {inputValue && (
              <p className="text-xs text-blue-500">입력값: {inputValue}</p>
            )}
            <Input
              label="에러 상태"
              value={errorInput}
              onChange={(e) => setErrorInput(e.target.value)}
              error="이미 사용 중인 이메일입니다"
              placeholder="에러 메시지 확인"
            />
            <Input label="비활성화" disabled placeholder="입력 불가" />
          </div>
        </section>

        {/* ── Badge ── */}
        <section className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
          <h2 className="text-base font-bold text-gray-700 mb-4 pb-2 border-b">Badge</h2>
          <div className="flex flex-wrap gap-3 items-center">
            <Badge variant="success">온라인</Badge>
            <Badge variant="warn">자리비움</Badge>
            <Badge variant="danger">오프라인</Badge>
            <Badge>외근 (default)</Badge>
          </div>
        </section>

        {/* ── Modal ── */}
        <section className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
          <h2 className="text-base font-bold text-gray-700 mb-4 pb-2 border-b">Modal</h2>
          <div className="flex gap-3">
            <Button onClick={() => setModalOpen(true)}>모달 열기</Button>
          </div>

          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="워크스페이스 만들기"
          >
            <div className="flex flex-col gap-4">
              <Input label="워크스페이스 이름" placeholder="예: 개발팀" />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setModalOpen(false)}>취소</Button>
                <Button onClick={() => { alert('생성!'); setModalOpen(false) }}>만들기</Button>
              </div>
            </div>
          </Modal>
        </section>

        {/* ── 조합 테스트 ── */}
        <section className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-base font-bold text-gray-700 mb-4 pb-2 border-b">조합 테스트 — 로그인 화면 흉내</h2>
          <div className="flex flex-col gap-4 max-w-sm">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">상태:</span>
              <Badge variant="success">온라인</Badge>
            </div>
            <Input label="이메일" type="email" placeholder="user@example.com" />
            <Input label="비밀번호" type="password" placeholder="••••••••" />
            <Button type="submit">로그인</Button>
            <Button variant="ghost">회원가입</Button>
          </div>
        </section>

      </div>

      {/* ── 글로벌 오버레이 요소들 (Full Screen Spinner & Toast) ── */}
      {spinnerFullScreen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <Spinner />
        </div>
      )}

      {toast.open && (
        <Toast
          isOpen={toast.open}
          type={toast.type}
          message={toast.message}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        />
      )}
    </div>
  )
}

export default ComponentTestPage