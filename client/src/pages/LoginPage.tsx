import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Input from '../components/Input'
import Modal from '../components/Modal'
import Toast from '../components/Toast'
import './LoginPage.css' // 구름 애니메이션 스타일 임포트
import hasiImg from './Hasi.png' // 이미지 경로에 맞게 임포트

const LoginPage = () => {
  const navigate = useNavigate()

  // ── 1. 상태 관리 (State) ──
  // 로그인 폼
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // 회원가입 모달 폼
  const [signUpOpen, setSignUpOpen] = useState(false)
  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpPw, setSignUpPw] = useState('')
  const [signUpPwConfirm, setSignUpPwConfirm] = useState('')

  // 계정 찾기 모달 폼
  const [findOpen, setFindOpen] = useState(false)
  const [findName, setFindName] = useState('')
  const [findPhone, setFindPhone] = useState('')

  // 글로벌 토스트 알림 상태
  const [toast, setToast] = useState<{ open: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({
    open: false,
    message: '',
    type: 'info',
  })

  // 기존 모의 데이터베이스 정보
  const mockDatabase = [
    { name: "田中", phone: "09012345678" },
    { name: "佐藤", phone: "08087654321" },
    { name: "鈴木", phone: "07011112222" }
  ]

  // ── 2. 헬퍼 함수 (Logic) ──
  const triggerToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    setToast({ open: true, message, type })
  }

  // 로그인 핸들러
  const handleLogin = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      triggerToast("有効なE-mail形式で入力してください。\n(올바른 이메일 양식으로 입력해주세요.)", "error")
      return
    }
    triggerToast("ログイン가 완료되었습니다.", "success")
    
    // 알림을 확인하고 안전하게 페이지를 넘기도록 1.2초 후 대시보드로 이동
    setTimeout(() => {
      navigate('/channel') 
    }, 1200)
  }

  // 회원가입 제출 핸들러
  const handleSignUpSubmit = () => {
    if (!signUpEmail.trim() || !signUpPw.trim() || !signUpPwConfirm.trim()) {
      triggerToast("すべての情報を入力してください。\n(모든 정보를 기입해주세요.)", "warning")
      return
    }
    if (signUpPw !== signUpPwConfirm) {
      triggerToast("パスワード가 일치하지 않습니다.", "error")
      return
    }
    triggerToast("メールを認証してください。(메일을 인증해주세요.)", "success")
    setSignUpOpen(false)
    setSignUpEmail(''); setSignUpPw(''); setSignUpPwConfirm('');
  }

  // 계정 찾기 제출 핸들러
  const handleFindSubmit = () => {
    if (!findName.trim() || !findPhone.trim()) {
      triggerToast("名前と電話番号の両方を入力してください。", "warning")
      return
    }
    const user = mockDatabase.find(u => u.name === findName && u.phone === findPhone)
    if (user) {
      triggerToast(`【認証完了】\n名前: ${findName}\n電話番号: ${findPhone}`, "success")
      setFindOpen(false)
      setFindName(''); setFindPhone('');
    } else {
      triggerToast("一致するデータがありません。(데이터가 없습니다.)", "error")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#a1c4fd] to-[#c2e9fb] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* 배경 구름 애니메이션 엘리먼트 */}
      <div className="clouds">
        <div className="cloud cloud1"></div>
        <div className="cloud cloud2"></div>
        <div className="cloud cloud3"></div>
      </div>

      {/* 중앙 메인 컨테이너 (컴포넌트 테스트 페이지와 조화로운 Tailwind 스타일 적용) */}
      <div className="w-full max-w-[700px] bg-white/95 rounded-xl shadow-lg flex flex-col md:flex-row z-10 overflow-hidden min-h-[400px] border border-white/20">
        
        {/* 좌측: 로그인 인터페이스 섹션 */}
        <div className="flex-1 flex flex-col justify-center p-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8 tracking-wider">LOGIN</h2>

          <div className="flex flex-col gap-4 mb-6">
            <Input 
              label="E-mail" 
              type="email" 
              placeholder="メールアドレスを入力してください" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input 
              label="パスワード" 
              type="password" 
              placeholder="パスワードを入力してください" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center text-xs text-gray-500 font-medium mb-6">
            <button className="hover:text-blue-500 hover:underline transition" onClick={() => setSignUpOpen(true)}>
              新規会員登録
            </button>
            <button className="hover:text-blue-500 hover:underline transition" onClick={() => setFindOpen(true)}>
              E-mail / パスワードをお忘れの方
            </button>
          </div>

          <Button onClick={handleLogin}>ログイン</Button>
        </div>

        {/* 우측: 브랜드 정보 섹션 */}
        <div className="w-full md:w-[300px] bg-blue-50/40 flex flex-col justify-center items-center p-8 border-t md:border-t-0 md:border-l border-gray-100">
          <img src={hasiImg} alt="Hasi Brand Badge" className="max-w-[100px] h-auto mb-5 drop-shadow-sm" />
          <h3 className="text-lg font-bold text-gray-800 mb-3">Hasi 브랜드</h3>
          <p className="text-sm text-gray-600 text-center leading-relaxed break-keep">
            팀 프로젝트에서 진행 중인<br />hasi 브랜드입니다.
          </p>
        </div>

      </div>

      {/* ── 3. 글로벌 모달 영역 (공용 컴포넌트) ── */}
      {/* 회원가입 모달 */}
      <Modal isOpen={signUpOpen} onClose={() => setSignUpOpen(false)} title="新規会員登録">
        <div className="flex flex-col gap-4">
          <Input 
            label="E-mail" 
            type="email" 
            placeholder="メールアドレスを入力" 
            value={signUpEmail}
            onChange={(e) => setSignUpEmail(e.target.value)}
          />
          <Input 
            label="パスワード" 
            type="password" 
            placeholder="パスワードを入力" 
            value={signUpPw}
            onChange={(e) => setSignUpPw(e.target.value)}
          />
          <Input 
            label="パスワード再記入" 
            type="password" 
            placeholder="パスワード를 재입력" 
            value={signUpPwConfirm}
            onChange={(e) => setSignUpPwConfirm(e.target.value)}
          />
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="ghost" onClick={() => setSignUpOpen(false)}>キャンセル (취소)</Button>
            <Button onClick={handleSignUpSubmit}>送信</Button>
          </div>
        </div>
      </Modal>

      {/* 정보 찾기 모달 */}
      <Modal isOpen={findOpen} onClose={() => setFindOpen(false)} title="E-mail / パ스ワードをお忘れの方">
        <div className="flex flex-col gap-4">
          <Input 
            label="名前" 
            placeholder="名前を入力してください" 
            value={findName}
            onChange={(e) => setFindName(e.target.value)}
          />
          <Input 
            label="電話番号" 
            placeholder="ハイフン(-)なしで入力" 
            value={findPhone}
            onChange={(e) => setFindPhone(e.target.value)}
          />
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="ghost" onClick={() => setFindOpen(false)}>キャンセル (취소)</Button>
            <Button onClick={handleFindSubmit}>送信</Button>
          </div>
        </div>
      </Modal>

      {/* ── 4. 글로벌 알림 영역 (공용 컴포넌트) ── */}
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

export default LoginPage