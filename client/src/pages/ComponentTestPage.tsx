// 공통 컴포넌트 테스트 페이지 — 개발 확인용
import { useState } from 'react'
import Button from '../components/Button'
import Input from '../components/Input'
import Modal from '../components/Modal'
import Badge from '../components/Badge'

const ComponentTestPage = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [errorInput, setErrorInput] = useState('')


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
    </div>
  )
}

export default ComponentTestPage
