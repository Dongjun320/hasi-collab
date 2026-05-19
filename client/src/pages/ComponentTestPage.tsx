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
  const [modalOpen, setModalOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [errorInput, setErrorInput] = useState('')
  const [spinnerFullScreen, setSpinnerFullScreen] = useState(false)
  const [toast, setToast] = useState<{
    open: boolean
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
  }>({ open: false, message: '', type: 'info' })

  const showToast = (message: string, type: typeof toast.type) => {
    setToast({ open: true, message, type })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">

        <h1 className="text-2xl font-bold text-gray-800 mb-2">공통 컴포넌트 테스트</h1>

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

        {/* ── Avatar ── */}
        <section className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
          <h2 className="text-base font-bold text-gray-700 mb-4 pb-2 border-b">Avatar</h2>
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs text-gray-500 mb-3">이미지 없을 때 — 이니셜 표시</p>
              <div className="flex items-end gap-4">
                <div className="flex flex-col items-center gap-1">
                  <Avatar name="김동준" size="sm" />
                  <span className="text-xs text-gray-400">sm</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Avatar name="박규태" size="md" />
                  <span className="text-xs text-gray-400">md</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Avatar name="정진우" size="lg" />
                  <span className="text-xs text-gray-400">lg</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-3">이미지 있을 때</p>
              <div className="flex items-end gap-4">
                <Avatar src="https://i.pravatar.cc/150?img=1" name="유저" size="sm" />
                <Avatar src="https://i.pravatar.cc/150?img=2" name="유저" size="md" />
                <Avatar src="https://i.pravatar.cc/150?img=3" name="유저" size="lg" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Spinner ── */}
        <section className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
          <h2 className="text-base font-bold text-gray-700 mb-4 pb-2 border-b">Spinner</h2>
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs text-gray-500 mb-3">사이즈별</p>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="sm" />
                  <span className="text-xs text-gray-400">sm</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="md" />
                  <span className="text-xs text-gray-400">md</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="lg" />
                  <span className="text-xs text-gray-400">lg</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-3">fullScreen — 화면 전체 덮기 (2초 후 자동 해제)</p>
              <Button onClick={() => {
                setSpinnerFullScreen(true)
                setTimeout(() => setSpinnerFullScreen(false), 2000)
              }}>
                fullScreen 테스트
              </Button>
              {spinnerFullScreen && <Spinner fullScreen />}
            </div>
          </div>
        </section>

        {/* ── Toast ── */}
        <section className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
          <h2 className="text-base font-bold text-gray-700 mb-4 pb-2 border-b">Toast</h2>
          <p className="text-xs text-gray-500 mb-3">버튼 클릭 시 우측 하단에 3초간 표시</p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => showToast('저장되었습니다', 'success')}>
              success
            </Button>
            <Button variant="danger" onClick={() => showToast('오류가 발생했습니다', 'error')}>
              error
            </Button>
            <Button variant="ghost" onClick={() => showToast('업데이트가 있습니다', 'info')}>
              info
            </Button>
            <Button variant="ghost" onClick={() => showToast('주의가 필요합니다', 'warning')}>
              warning
            </Button>
          </div>
          <Toast
            isOpen={toast.open}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast((t) => ({ ...t, open: false }))}
          />
        </section>

        {/* ── Modal ── */}
        <section className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
          <h2 className="text-base font-bold text-gray-700 mb-4 pb-2 border-b">Modal</h2>
          <Button onClick={() => setModalOpen(true)}>모달 열기</Button>
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
            <div className="flex items-center gap-3">
              <Avatar name="김동준" size="md" />
              <div>
                <p className="text-sm font-medium text-gray-800">김동준</p>
                <Badge variant="success">온라인</Badge>
              </div>
            </div>
            <Input label="이메일" type="email" placeholder="user@example.com" />
            <Input label="비밀번호" type="password" placeholder="••••••••" />
            <Button type="submit" onClick={() => showToast('로그인 성공!', 'success')}>
              로그인
            </Button>
            <Button variant="ghost">회원가입</Button>
          </div>
        </section>

      </div>
    </div>
  )
}

export default ComponentTestPage
