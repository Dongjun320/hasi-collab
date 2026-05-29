import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Input from '../components/Input'
import Modal from '../components/Modal'
import Toast from '../components/Toast'
import hasiImg from './Hasi.png'
import LoadingPopup from '../components/LoadingPopup'

const LoginPage = () => {
  const navigate = useNavigate()

  // ── 1. 상태 관리 (State) ──
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loadingOpen, setLoadingOpen] = useState(false)

  const [signUpOpen, setSignUpOpen] = useState(false)
  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpCode, setSignUpCode] = useState('')
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [signUpPw, setSignUpPw] = useState('')
  const [signUpPwConfirm, setSignUpPwConfirm] = useState('')

  const [findOpen, setFindOpen] = useState(false)
  const [findName, setFindName] = useState('')
  const [findPhone, setFindPhone] = useState('')
  
  const [signUpNickname, setSignUpNickname] = useState('')
  const [isNicknameVerified, setIsNicknameVerified] = useState(false)

  // 테스트용 가상 중복 닉네임 데이터
  const mockNicknames = ['admin', 'test', 'hasi']

  const [toast, setToast] = useState<{ open: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({
    open: false,
    message: '',
    type: 'info',
  })

  const mockDatabase = [
    { name: "田中", phone: "09012345678" },
    { name: "佐藤", phone: "08087654321" },
    { name: "鈴木", phone: "07011112222" }
  ]

  // ── 2. 헬퍼 함수 (Logic) ──
  const triggerToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    setToast({ open: true, message, type })
  }

const handleCheckNickname = () => {
  if (!signUpNickname.trim()) {
    triggerToast("닉네임을 입력해주세요.", "warning")
    return
  }
  
  if (mockNicknames.includes(signUpNickname)) {
    // 중복일 경우
    triggerToast("중복된 닉네임입니다.", "error")
    setIsNicknameVerified(false)
  } else {
    // 사용 가능할 경우
    triggerToast("사용가능한 닉네임입니다.", "success")
    setIsNicknameVerified(true)
  }
  const handleSignUpSubmit = () => {
  // 닉네임 입력 여부도 함께 검사하도록 수정
  if (!signUpEmail.trim() || !signUpPw.trim() || !signUpPwConfirm.trim() || !signUpNickname.trim()) {
    triggerToast("すべての情報を入力してください。", "warning")
    return
  }
  if (!isVerified) {
    triggerToast("E-mail認証を完了してください。", "warning")
    return
  }
  // 닉네임 중복 확인 여부 검사 추가
  if (!isNicknameVerified) {
    triggerToast("닉네임 중복 확인을 완료해주세요.", "warning")
    return
  }
  if (signUpPw !== signUpPwConfirm) {
    triggerToast("パスワードが一致しません。", "error")
    return
  }
  
  triggerToast("会員登録が完了しました。", "success")
  setSignUpOpen(false)
  setSignUpEmail('')
  setSignUpPw('')
  setSignUpPwConfirm('')
  setSignUpCode('')
  setSignUpNickname('') // 닉네임 초기화 추가
  
  setIsCodeSent(false)
  setIsVerified(false)
  setIsNicknameVerified(false) // 닉네임 인증 상태 초기화 추가
}
}
  const handleLogin = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      triggerToast("有効なE-mail形式で入力してください。", "error")
      return
    }
    triggerToast("ログインが完了しました。", "success")
    
    setTimeout(() => {
      setLoadingOpen(true)
    }, 1200)
  }

  const handleSendEmail = () => {
    if (!signUpEmail.trim()) {
      triggerToast("E-mailを入力してください。", "warning")
      return
    }
    setIsCodeSent(true)
    triggerToast("メールの送信が完了しました。", "success")
  }

  const handleVerifyCode = () => {
    if (!signUpCode.trim()) {
      triggerToast("認証コードを入力してください。", "warning")
      return
    }
    setIsVerified(true)
    triggerToast("認証が完了しました。", "success")
  }

  const handleSignUpSubmit = () => {
    if (!signUpEmail.trim() || !signUpPw.trim() || !signUpPwConfirm.trim()) {
      triggerToast("すべての情報を入力してください。", "warning")
      return
    }
    if (!isVerified) {
      triggerToast("E-mail認証を完了してください。", "warning")
      return
    }
    if (signUpPw !== signUpPwConfirm) {
      triggerToast("パスワードが一致しません。", "error")
      return
    }
    triggerToast("会員登録が完了しました。", "success")
    setSignUpOpen(false)
    setSignUpEmail(''); setSignUpPw(''); setSignUpPwConfirm(''); setSignUpCode('');
    setIsCodeSent(false); setIsVerified(false);
  }

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
      triggerToast("一致するデータがありません。", "error")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-emerald-800 to-emerald-100 flex items-center justify-center p-4 relative overflow-hidden">
      
      <div className="w-full max-w-[800px] bg-white/95 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col md:flex-row z-10 overflow-hidden min-h-[450px] border border-white/50">
        
        {/* 왼쪽: 로그인 폼 영역 */}
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
            <button className="hover:text-emerald-600 hover:underline transition" onClick={() => setSignUpOpen(true)}>
              新規会員登録
            </button>
            <button className="hover:text-emerald-600 hover:underline transition" onClick={() => setFindOpen(true)}>
              E-mail / パスワードをお忘れの方
            </button>
          </div>

          <Button onClick={handleLogin}>ログイン</Button>
        </div>

        {/* 오른쪽: 브랜드 및 소셜 로그인 영역 */}
        <div className="w-full md:w-[320px] bg-emerald-50/80 flex flex-col items-center p-8 border-t md:border-t-0 md:border-l border-emerald-100/50">
          
          <div className="flex flex-col items-center mb-6 mt-2">
            <img src={hasiImg} alt="Hasi Brand Badge" className="w-[95px] h-auto mb-4 drop-shadow-md rounded-full" />
            <h3 className="text-xl font-bold text-gray-950 mb-1.5 tracking-wide">Hasi Brand</h3>
            <p className="text-xs text-gray-600 text-center leading-relaxed break-keep">
              チームプロジェクトで進行中の<br />Hasiブランドです。
            </p>
          </div>

          <div className="flex flex-col gap-2.5 w-full mt-auto mb-2">
            
            {/* Google Button */}
            <button className="relative flex items-center justify-center w-full py-2.5 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition duration-200">
              <div className="absolute left-5 flex items-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
              </div>
              <span className="font-semibold text-gray-700 text-sm">Google</span>
            </button>

           {/* Amazon Button (수정완료: 제공해주신 고해상도 SVG 적용) */}
            <button className="relative flex items-center justify-center w-full py-2.5 bg-[#131921] rounded-full shadow-sm hover:bg-[#232f3e] transition duration-200">
              <div className="absolute left-5 flex items-center">
                {/* JSX 문법에 맞게 속성(fillRule 등)을 변환하고, 사이즈를 다른 버튼과 어울리게 맞췄습니다. */}
                <svg viewBox="0 0 512 512" className="w-[22px] h-[22px]">
                  {/* 하얀색 'a' 패스 */}
                  <path 
                    d="M301.3 216.3c0 26.4.7 48.4-12.7 71.8-10.8 19.1-27.8 30.8-46.9 30.8-26 0-41.2-19.8-41.2-49.1 0-57.7 51.7-68.2 100.7-68.2v14.7zm68.3 165.1c-4.5 4-11 4.3-16 1.6-22.5-18.7-26.5-27.3-38.9-45.2-37.2 37.9-63.4 49.3-111.7 49.3-57 0-101.4-35.2-101.4-105.6 0-55 29.8-92.4 72.2-110.7 36.8-16.2 88.1-19.1 127.4-23.5v-8.8c0-16.1 1.2-35.2-8.2-49.1-8.3-12.5-24.1-17.6-38-17.6-25.8 0-48.9 13.2-54.5 40.7-1.1 6.1-5.6 12.1-11.7 12.4l-65.7-7c-5.5-1.2-11.6-5.7-10.1-14.2C128.2 24 200.1 0 264.5 0c33 0 76 8.8 102 33.7 33 30.8 29.8 71.8 29.8 116.5v105.6c0 31.7 13.1 45.6 25.5 62.8 4.4 6.1 5.3 13.4-.2 18-13.8 11.5-38.4 33-51.9 45z" 
                    fill="#fff" 
                    fillRule="evenodd" 
                    clipRule="evenodd" 
                  />
                  {/* 오렌지색 스마일 화살표 패스 */}
                  <path 
                    d="M443.4 421.5C232.1 522 100.9 437.9 16.9 386.8c-5.2-3.2-14 .8-6.4 9.6C38.6 430.3 130.2 512 249.9 512s191-65.3 199.9-76.7c8.8-11.3 2.5-17.6-6.4-13.8m59.3-32.8c-5.7-7.4-34.5-8.8-52.7-6.5-18.2 2.2-45.5 13.3-43.1 19.9 1.2 2.5 3.7 1.4 16.2.3 12.5-1.2 47.6-5.7 54.9 3.9s-11.2 55.4-14.6 62.8c-3.3 7.4 1.2 9.3 7.4 4.4 6.1-4.9 17-17.7 24.4-35.7 7.4-18.2 11.8-43.5 7.5-49.1" 
                    fill="#f90" 
                  />
                </svg>
              </div>
              <span className="font-semibold text-white text-sm">Amazon</span>
            </button>
            
            {/* Line Button (수정완료: 하얀 말풍선 + 초록색 텍스트) */}
            <button className="relative flex items-center justify-center w-full py-2.5 bg-[#06C755] rounded-full shadow-sm hover:bg-[#05b34c] transition duration-200">
              <div className="absolute left-5 flex items-center">
                <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]">
                  <path d="M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" fill="#ffffff"/>
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.282.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.348 0 .63.285.63.63v4.141h1.754c.345 0 .627.283.627.63 0 .344-.282.629-.627.629" fill="#06C755"/>
                </svg>
              </div>
              <span className="font-semibold text-white text-sm">Line</span>
            </button>
            
            {/* X Button (수정완료: 공식 비율 로고) */}
            <button className="relative flex items-center justify-center w-full py-2.5 bg-black rounded-full shadow-sm hover:bg-zinc-900 transition duration-200">
              <div className="absolute left-5 flex items-center">
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] text-white" fill="currentColor">
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
                </svg>
              </div>
              <span className="font-semibold text-white text-sm">X</span>
            </button>
          </div>

        </div>

      </div>

      {/* ── 3. 모달 영역 ── */}
      <Modal isOpen={signUpOpen} onClose={() => setSignUpOpen(false)} title="新規会員登録">
        <div className="flex flex-col gap-4">
          
          {/* 1. 이메일 입력 블록 */}
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

          {/* 2. 인증코드 입력 블록 */}
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
          </div> {/* <--- 인증코드 블록이 끝나는 여기 바로 아래에 삽입합니다. */}

          {/* ──────────────── 심어줄 닉네임 입력 및 중복 확인 영역 ──────────────── */}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input 
                label="닉네임" 
                type="text" 
                placeholder="닉네임을 입력해주세요" 
                value={signUpNickname}
                onChange={(e) => {
                  setSignUpNickname(e.target.value)
                  setIsNicknameVerified(false)
                }}
                disabled={isNicknameVerified}
              />
            </div>
            <div className="mb-[2px]">
              <Button onClick={handleCheckNickname} disabled={isNicknameVerified}>
                {isNicknameVerified ? "확인 완료" : "확인"}
              </Button>
            </div>
          </div>
          {/* ────────────────────────────────────────────────────────────────── */}

          {/* 3. 패스워드 입력란 (여기 위쪽에 위치하게 됩니다) */}
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
        <LoadingPopup onFinish={() => navigate('/WorkspaceHome')} /> 
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