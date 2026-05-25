import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Input from '../components/Input'
import Modal from '../components/Modal'
import Toast from '../components/Toast'
import './LoginPage.css' 
import hasiImg from './Hasi.png' 
import LoadingPopup from '../components/LoadingPopup' //5.25 추가 김상현

const LoginPage = () => {
  const navigate = useNavigate()

  // ── 1. 상태 관리 (State) ──
  // 로그인 폼
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loadingOpen, setLoadingOpen] = useState(false) // 5.25 추가 김상현


  // 회원가입 모달 폼
  const [signUpOpen, setSignUpOpen] = useState(false)
  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpCode, setSignUpCode] = useState('') // 인증코드 상태 추가
  const [isCodeSent, setIsCodeSent] = useState(false) // 이메일 전송 여부 상태
  const [isVerified, setIsVerified] = useState(false) // 인증 완료 여부 상태
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
      triggerToast("有効なE-mail形式で入力してください。", "error") // 올바른 이메일 양식으로 입력해주세요.
      return
    }
    triggerToast("ログインが完了しました。", "success") // 로그인이 완료되었습니다.
    
    setTimeout(() => {
      setLoadingOpen(true)  //5.25 수정 김상현
    }, 1200)
  }

  // 이메일 전송 핸들러
  const handleSendEmail = () => {
    if (!signUpEmail.trim()) {
      triggerToast("E-mailを入力してください。", "warning") // 이메일을 입력해주세요.
      return
    }
    setIsCodeSent(true)
    triggerToast("メールの送信が完了しました。", "success") // 메일 전송이 완료되었습니다.
  }

  // 인증코드 확인 핸들러
  const handleVerifyCode = () => {
    if (!signUpCode.trim()) {
      triggerToast("認証コードを入力してください。", "warning") // 인증코드를 입력해주세요.
      return
    }
    setIsVerified(true)
    triggerToast("認証が完了しました。", "success") // 인증이 완료되었습니다.
  }

  // 회원가입 제출 핸들러
  const handleSignUpSubmit = () => {
    if (!signUpEmail.trim() || !signUpPw.trim() || !signUpPwConfirm.trim()) {
      triggerToast("すべての情報を入力してください。", "warning") // 모든 정보를 기입해주세요.
      return
    }
    if (!isVerified) {
      triggerToast("E-mail認証を完了してください。", "warning") // 이메일 인증을 완료해주세요.
      return
    }
    if (signUpPw !== signUpPwConfirm) {
      triggerToast("パスワードが一致しません。", "error") // 비밀번호가 일치하지 않습니다.
      return
    }
    triggerToast("会員登録が完了しました。", "success") // 회원가입이 완료되었습니다.
    setSignUpOpen(false)
    // 폼 초기화
    setSignUpEmail(''); setSignUpPw(''); setSignUpPwConfirm(''); setSignUpCode('');
    setIsCodeSent(false); setIsVerified(false);
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
      triggerToast("一致するデータがありません。", "error") // 데이터가 없습니다.
    }
  }


  return (
    // 배경을 파스텔 그린 그라데이션으로 변경 (from-emerald-50 to-teal-100)
    <div className="min-h-screen bg-gradient-to-br from-[#f0fdf4] to-[#ccfbf1] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* 배경 구름 애니메이션 엘리먼트 */}
      <div className="clouds">
        <div className="cloud cloud1"></div>
        <div className="cloud cloud2"></div>
        <div className="cloud cloud3"></div>
      </div>

      {/* 중앙 메인 컨테이너 */}
      <div className="w-full max-w-[700px] bg-white/95 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col md:flex-row z-10 overflow-hidden min-h-[400px] border border-white/50">
        
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
            {/* 호버 시 에메랄드(파스텔 그린) 색상으로 변경 */}
            <button className="hover:text-emerald-500 hover:underline transition" onClick={() => setSignUpOpen(true)}>
              新規会員登録
            </button>
            <button className="hover:text-emerald-500 hover:underline transition" onClick={() => setFindOpen(true)}>
              E-mail / パスワードをお忘れの方
            </button>
          </div>

          <Button onClick={handleLogin}>ログイン</Button>
        </div>

        {/* 우측: 브랜드 정보 섹션 (배경을 연한 그린 톤으로 변경 bg-emerald-50/50) */}
        <div className="w-full md:w-[300px] bg-emerald-50/50 flex flex-col justify-center items-center p-8 border-t md:border-t-0 md:border-l border-emerald-100/50">
          <img src={hasiImg} alt="Hasi Brand Badge" className="max-w-[120px] h-auto mb-6 drop-shadow-sm" />
          <h3 className="text-lg font-bold text-gray-800 mb-3 tracking-wide">Hasi Brand</h3>
          <p className="text-sm text-gray-600 text-center leading-relaxed break-keep">
            チームプロジェクトで進行中の<br />Hasiブランドです。
          </p>
        </div>

      </div>

      {/* ── 3. 글로벌 모달 영역 ── */}
      {/* 회원가입 모달 */}
      <Modal isOpen={signUpOpen} onClose={() => setSignUpOpen(false)} title="新規会員登録">
        <div className="flex flex-col gap-4">
          
          {/* 이메일 입력 및 전송 버튼 */}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input 
                label="E-mail" 
                type="email" 
                placeholder="メールアドレスを入力" 
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                disabled={isVerified}
              />
            </div>
            <div className="mb-[2px]">
              <Button onClick={handleSendEmail} disabled={isVerified} variant={isCodeSent ? "ghost" : "primary"}>
                {isCodeSent ? "再送信" : "メール送信"}
              </Button>
            </div>
          </div>

          {/* 인증코드 입력 및 인증완료 버튼 (이메일 전송 후에만 표시되도록 하려면 isCodeSent 조건 추가 가능) */}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input 
                label="認証コード" 
                type="text" 
                placeholder="認証コードを入力" 
                value={signUpCode}
                onChange={(e) => setSignUpCode(e.target.value)}
                disabled={isVerified}
              />
            </div>
            <div className="mb-[2px]">
              <Button onClick={handleVerifyCode} disabled={isVerified}>
                {isVerified ? "認証完了" : "認証確認"}
              </Button>
            </div>
          </div>

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
            placeholder="パスワードを再入力" 
            value={signUpPwConfirm}
            onChange={(e) => setSignUpPwConfirm(e.target.value)}
          />
          
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="ghost" onClick={() => setSignUpOpen(false)}>キャンセル</Button>
            <Button onClick={handleSignUpSubmit}>登録する</Button>
          </div>
        </div>
      </Modal>

      {/* 정보 찾기 모달 */}
      <Modal isOpen={findOpen} onClose={() => setFindOpen(false)} title="E-mail / パスワードをお忘れの方">
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
            <Button variant="ghost" onClick={() => setFindOpen(false)}>キャンセル</Button>
            <Button onClick={handleFindSubmit}>送信</Button>
          </div>
        </div>
      </Modal>

      {/* ── 4. 글로벌 알림 영역 ── */}
      {loadingOpen && (
        <LoadingPopup onFinish={() => navigate('/channel')} /> //5.25 추가 김상현
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

export default LoginPage