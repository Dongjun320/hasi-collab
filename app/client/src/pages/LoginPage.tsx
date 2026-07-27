import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Input from '../components/Input'
import Modal from '../components/Modal'
import hasiImg from './Hasi.png'
import LoadingPopup from '../components/LoadingPopup'
import { api } from '../api/client'
import { useAuthStore } from '../store/authStore'
import { toast } from '../store/toastStore'

const LoginPage = () => {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  // ── 1. 상태 관리 (State) ──
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loadingOpen, setLoadingOpen] = useState(false)

  // 회원가입 상태
  const [signUpOpen, setSignUpOpen] = useState(false)
  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpNickname, setSignUpNickname] = useState('')
  const [signUpCode, setSignUpCode] = useState('')
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [signUpPw, setSignUpPw] = useState('')
  const [signUpPwConfirm, setSignUpPwConfirm] = useState('')

  // 비밀번호 찾기(재설정) 전용 상태
  const [findOpen, setFindOpen] = useState(false)
  const [findEmail, setFindEmail] = useState('')
  const [findCode, setFindCode] = useState('')
  const [isFindCodeSent, setIsFindCodeSent] = useState(false)
  const [isFindVerified, setIsFindVerified] = useState(false)
  const [newPw, setNewPw] = useState('')
  const [newPwConfirm, setNewPwConfirm] = useState('')

  // ── 2. 헬퍼 함수 (Logic) ──
  // 엔터키 감지 핸들러 추가
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  // 로그인 로직 (메인 폼에서 인증 성공 시에만 navigate 이동)
  const handleLogin = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error("有効なE-mail形式で入力してください。")
      return
    }

    setLoadingOpen(true)
    const { data, error } = await api.POST('/api/auth/login', { body: { email, password } })
    if (error) {
      setLoadingOpen(false)
      const errorCode = (error as any)?.error?.code
      if (errorCode === 'AUTH_001') {
        toast.error("アカウント情報が一致しません。")
      } else {
        toast.error("ログインに失敗しました。メールとパスワードをご確認ください。")
      }
      return
    }
    if (data && data.accessToken) {
      setAuth(data.user as any, data.accessToken, data.refreshToken)
      toast.success("ログインが完了しました。")
      setTimeout(() => navigate('/WorkspaceHome'), 1200)
    }
  }

  // 회원가입 이메일 발송
  const handleSendEmail = async () => {
    if (!signUpEmail.trim()) {
      toast.warning("E-mailを入力してください。")
      return
    }
    const { error } = await api.POST('/api/auth/email/send', { body: { email: signUpEmail } })
    if (error) {
      toast.error("メール送信に失敗しました。")
      return
    }
    setIsCodeSent(true)
    toast.success("メールの送信が完了しました。")
  }

  // 회원가입 인증코드 확인
  const handleVerifyCode = async () => {
    if (!signUpCode.trim()) {
      toast.warning("認証コードを入力してください。")
      return
    }
    const { error } = await api.POST('/api/auth/email/verify', { body: { email: signUpEmail, code: signUpCode } })
    if (error) {
      toast.error("認証に失敗しました。コードをご確認ください。")
      return
    }
    setIsVerified(true)
    toast.success("認証が完了しました。")
  }

  // 회원가입 제출 (완료 시 모달 닫기 및 메인 폼에 정보 채우기)
  const handleSignUpSubmit = async () => {
    if (!signUpEmail.trim() || !signUpPw.trim() || !signUpPwConfirm.trim()) {
      toast.warning("すべての情報を入力してください。")
      return
    }
    if (!isVerified) {
      toast.warning("E-mail認証を完了してください。")
      return
    }
    if (signUpPw !== signUpPwConfirm) {
      toast.error("パスワードが一致しません。")
      return
    }

    const { error } = await api.POST('/api/auth/register', {
      body: { email: signUpEmail, password: signUpPw, nickname: signUpNickname }
    })

    if (error) {
      toast.error("会員登録に失敗しました。")
      return
    }

    toast.success("会員登録が完了しました。ログインしてください。")

    // 사용자가 바로 로그인할 수 있도록 메인 폼에 이메일/비밀번호 자동 입력
    setEmail(signUpEmail)
    setPassword(signUpPw)

    // 모달 닫기
    setSignUpOpen(false)

    // 상태 초기화
    setSignUpEmail(''); setSignUpNickname(''); setSignUpPw(''); setSignUpPwConfirm(''); setSignUpCode('');
    setIsCodeSent(false); setIsVerified(false);
  }

  // 비밀번호 재설정 이메일 발송
  const handleFindSendEmail = async () => {
    if (!findEmail.trim()) {
      toast.warning("E-mailを入力してください。")
      return
    }
    const { error } = await api.POST('/api/auth/password/send', {
      body: { email: findEmail } as any
    })
    if (error) {
      toast.error("メール送信に失敗しました。")
      return
    }
    setIsFindCodeSent(true)
    toast.success("メールの送信が完了しました。")
  }

  // 비밀번호 재설정 코드 확인
  const handleFindVerifyCode = async () => {
    if (!findCode.trim()) {
      toast.warning("認証コードを入力してください。")
      return
    }
    const { error } = await api.POST('/api/auth/password/verify', { body: { email: findEmail, code: findCode } })
    if (error) {
      toast.error("認証に失敗しました。コードをご確認ください。")
      return
    }
    setIsFindVerified(true)
    toast.success("認証が完了しました。")
  }

  // 비밀번호 재설정 제출 (완료 시 모달 닫기 및 메인 폼에 정보 채우기)
  const handleResetPasswordSubmit = async () => {
    if (!findEmail.trim() || !newPw.trim() || !newPwConfirm.trim()) {
      toast.warning("すべての情報を入力してください。")
      return
    }
    if (!isFindVerified) {
      toast.warning("E-mail認証を完了してください。")
      return
    }
    if (newPw !== newPwConfirm) {
      toast.error("パスワードが一致しません。")
      return
    }

    const { error } = await api.POST('/api/auth/password/reset' as any, {
      body: { email: findEmail, newPassword: newPw } as any
    })

    if (error) {
      toast.error("パスワードの変更に失敗しました。")
      return
    }

    toast.success("パスワードが変更されました。新しいパスワードでログインしてください。")

    // 사용자가 바로 로그인할 수 있도록 메인 폼에 이메일/비밀번호 자동 입력
    setEmail(findEmail)
    setPassword(newPw)

    // 모달 닫기
    setFindOpen(false)

    // 상태 초기화
    setFindEmail(''); setFindCode(''); setNewPw(''); setNewPwConfirm('');
    setIsFindCodeSent(false); setIsFindVerified(false);
  }

  return (
      <div className="min-h-screen bg-gradient-to-r from-emerald-800 to-emerald-100 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="w-full max-w-[800px] bg-white/95 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col md:flex-row z-10 overflow-hidden min-h-[450px] border border-white/50">

          {/* 왼쪽: 로그인 폼 영역 */}
          <div className="flex-1 flex flex-col justify-center p-8">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-8 tracking-wider">LOGIN</h2>

            <div className="flex flex-col gap-4 mb-6" onKeyDown={handleKeyDown}>
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
                パスワード再設定
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
              <button
                  onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'}
                  className="relative flex items-center justify-center w-full py-2.5 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition duration-200">
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

              {/* Amazon Button */}
              <button
                  onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/amazon'}
                  className="relative flex items-center justify-center w-full py-2.5 bg-[#131921] rounded-full shadow-sm hover:bg-[#232f3e] transition duration-200">
                <div className="absolute left-5 flex items-center">
                  <svg viewBox="0 0 512 512" className="w-[22px] h-[22px]">
                    <path d="M301.3 216.3c0 26.4.7 48.4-12.7 71.8-10.8 19.1-27.8 30.8-46.9 30.8-26 0-41.2-19.8-41.2-49.1 0-57.7 51.7-68.2 100.7-68.2v14.7zm68.3 165.1c-4.5 4-11 4.3-16 1.6-22.5-18.7-26.5-27.3-38.9-45.2-37.2 37.9-63.4 49.3-111.7 49.3-57 0-101.4-35.2-101.4-105.6 0-55 29.8-92.4 72.2-110.7 36.8-16.2 88.1-19.1 127.4-23.5v-8.8c0-16.1 1.2-35.2-8.2-49.1-8.3-12.5-24.1-17.6-38-17.6-25.8 0-48.9 13.2-54.5 40.7-1.1 6.1-5.6 12.1-11.7 12.4l-65.7-7c-5.5-1.2-11.6-5.7-10.1-14.2C128.2 24 200.1 0 264.5 0c33 0 76 8.8 102 33.7 33 30.8 29.8 71.8 29.8 116.5v105.6c0 31.7 13.1 45.6 25.5 62.8 4.4 6.1 5.3 13.4-.2 18-13.8 11.5-38.4 33-51.9 45z" fill="#fff" fillRule="evenodd" clipRule="evenodd" />
                    <path d="M443.4 421.5C232.1 522 100.9 437.9 16.9 386.8c-5.2-3.2-14 .8-6.4 9.6C38.6 430.3 130.2 512 249.9 512s191-65.3 199.9-76.7c8.8-11.3 2.5-17.6-6.4-13.8m59.3-32.8c-5.7-7.4-34.5-8.8-52.7-6.5-18.2 2.2-45.5 13.3-43.1 19.9 1.2 2.5 3.7 1.4 16.2.3 12.5-1.2 47.6-5.7 54.9 3.9s-11.2 55.4-14.6 62.8c-3.3 7.4 1.2 9.3 7.4 4.4 6.1-4.9 17-17.7 24.4-35.7 7.4-18.2 11.8-43.5 7.5-49.1" fill="#f90" />
                  </svg>
                </div>
                <span className="font-semibold text-white text-sm">Amazon</span>
              </button>

              {/* Line Button */}
              <button
                  onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/line'}
                  className="relative flex items-center justify-center w-full py-2.5 bg-[#06C755] rounded-full shadow-sm hover:bg-[#05b34c] transition duration-200">
                <div className="absolute left-5 flex items-center">
                  <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]">
                    <path d="M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" fill="#ffffff"/>
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.282.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.348 0 .63.285.63.63v4.141h1.754c.345 0 .627.283.627.63 0 .344-.282.629-.627.629" fill="#06C755"/>
                  </svg>
                </div>
                <span className="font-semibold text-white text-sm">Line</span>
              </button>

              {/* X Button */}
              <button
                  onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/twitter'}
                  className="relative flex items-center justify-center w-full py-2.5 bg-black rounded-full shadow-sm hover:bg-zinc-900 transition duration-200">
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

        {/* 회원가입 모달 */}
        <Modal isOpen={signUpOpen} onClose={() => setSignUpOpen(false)} title="新規会員登録">
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
                label="ニックネーム"
                type="text"
                placeholder="ニックネームを入力"
                value={signUpNickname}
                onChange={(e) => setSignUpNickname(e.target.value)}
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

        {/* 비밀번호 재설정 모달 */}
        <Modal isOpen={findOpen} onClose={() => {
          setFindOpen(false);
          setFindEmail(''); setFindCode(''); setNewPw(''); setNewPwConfirm('');
          setIsFindCodeSent(false); setIsFindVerified(false);
        }} title="パスワード再設定">
          <div className="flex flex-col gap-4">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                    label="E-mail"
                    type="email"
                    placeholder="登録したE-mailを入力"
                    value={findEmail}
                    onChange={(e) => setFindEmail(e.target.value)}
                    disabled={isFindVerified}
                />
              </div>
              <div className="mb-[2px]">
                <Button onClick={handleFindSendEmail} disabled={isFindVerified} variant={isFindCodeSent ? "ghost" : "primary"}>
                  {isFindCodeSent ? "再送信" : "メール送信"}
                </Button>
              </div>
            </div>

            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                    label="認証コード"
                    type="text"
                    placeholder="認証コードを入力"
                    value={findCode}
                    onChange={(e) => setFindCode(e.target.value)}
                    disabled={isFindVerified}
                />
              </div>
              <div className="mb-[2px]">
                <Button onClick={handleFindVerifyCode} disabled={isFindVerified}>
                  {isFindVerified ? "認証完了" : "認証確認"}
                </Button>
              </div>
            </div>

            <Input
                label="新しいパスワード"
                type="password"
                placeholder="新しいパスワードを入力"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
            />
            <Input
                label="新しいパスワード(確認)"
                type="password"
                placeholder="新しいパスワードを再入力"
                value={newPwConfirm}
                onChange={(e) => setNewPwConfirm(e.target.value)}
            />

            <div className="flex gap-2 justify-end mt-4">
              <Button variant="ghost" onClick={() => setFindOpen(false)}>キャンセル</Button>
              <Button onClick={handleResetPasswordSubmit}>変更する</Button>
            </div>
          </div>
        </Modal>

        {/* ── 4. 글로벌 알림 영역 ── */}
        {loadingOpen && <LoadingPopup onFinish={() => navigate('/WorkspaceHome')} />}
      </div>
  )
}

export default LoginPage