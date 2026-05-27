import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Input from '../components/Input'
import Modal from '../components/Modal'
import Toast from '../components/Toast'
// import './LoginPage.css' // CSS 파일 내용을 모두 지웠다면 이 줄도 삭제하거나 주석 처리하세요.
import hasiImg from './Hasi.png' 

const LoginPage = () => {
  const navigate = useNavigate()

  // ── 1. 상태 관리 (State) ──
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

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

  const handleLogin = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      triggerToast("有効なE-mail形式で入力してください。", "error")
      return
    }
    triggerToast("ログインが完了しました。", "success")
    
    setTimeout(() => {
      navigate('/channel') 
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

 // ... (위쪽 상태 관리 및 함수 코드는 기존과 동일)

  return (
    // 배경색 클래스 수정: bg-gradient-to-r from-emerald-800 to-emerald-100
    <div className="min-h-screen bg-gradient-to-r from-emerald-800 to-emerald-100 flex items-center justify-center p-4 relative overflow-hidden">
      
      <div className="w-full max-w-[700px] bg-white/95 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col md:flex-row z-10 overflow-hidden min-h-[400px] border border-white/50">
        
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

        <div className="w-full md:w-[300px] bg-emerald-50/80 flex flex-col justify-center items-center p-8 border-t md:border-t-0 md:border-l border-emerald-100/50">
          <img src={hasiImg} alt="Hasi Brand Badge" className="max-w-[120px] h-auto mb-6 drop-shadow-sm" />
          <h3 className="text-lg font-bold text-gray-800 mb-3 tracking-wide">Hasi Brand</h3>
          <p className="text-sm text-gray-600 text-center leading-relaxed break-keep">
            チームプロジェクトで進行中の<br />Hasiブランドです。
          </p>
        </div>

      </div>

      {/* 모달 영역 등 나머지 코드는 기존과 동일하게 유지 */}
      


      {/* 모달 영역 등 나머지 코드는 동일하게 유지 */}
      <Modal isOpen={signUpOpen} onClose={() => setSignUpOpen(false)} title="新規会員登録">
        {/* 기존 모달 내용 */}
        <div className="flex flex-col gap-4">
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