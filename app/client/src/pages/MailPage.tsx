import { useEffect, useState } from 'react'
// import { api } from '.../api/client'

interface Mail {
    id: number
    subject: string
    from: string
    date: string
    read : boolean
    body : string
}

const MailPage = () => {
    const [mails, setMails] = useState<Mail[]>([])
    const [selectedMail, setSelectedMail] = useState<Mail | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // accountId는 추후 로그인 사용자 기반으로 변경 예정 1 = test
    useEffect(() => {
        fetchMails()
    }, [])

    const fetchMails = async () => {
        setLoading(true)
        try {
            const res = await fetch('http://localhost:8080/api/v1/mail/accounts/2/mails?limit=30', {
                headers: {
                    Authorization: `Bearer ${JSON.parse(localStorage.getItem('hasi-auth') || '{}')?.state?.accessToken}`
                }
            })
            const data = await res.json()
                setMails(data)
        } catch (e) {
            setError('メールの取得に失敗しました')
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className="flex h-full bg-white">
            <div className="w-80 border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="font-bold text-gray-800 text-lg">受信トレイ</h2>
                    <p className="text-xs text-gray-500 mt-1">{mails.length}件</p>
                </div>
                {loading && (
                    <div className="flex-1 flex item-center justify-center text-gray-400 text-sm">
                        読み込み中...
                    </div>
                )}

                {error && (
                    <div className="p-4 text-red-500 text-sm">{error}</div>
                    )}

                <div className="flex-1 overflow-y-auto">
                    {mails.map((mail: Mail) => (
                        <div
                            key={mail.id}
                            onClick={() => setSelectedMail(mail)}
                            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition
                                ${selectedMail?.id === mail.id ? 'bg-emerald-50 border-1-4 border-1-emerald-500' : ''}
                                ${!mail.read ? 'font-semibold' : ''}
                                `}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-800 truncate flex-1">{mail.from.split('<')[0].trim()}</span>
                                <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                                    {new Date(mail.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                            <div className="text-sm text-gray-700 truncate">{mail.subject}</div>
                            <div className="text-xs text-gray-400 truncate mt-0.5">
                                {mail.body.slice(0, 50)}...
                            </div>
                        </div>
                        ))}
                </div>
        </div>

        <div className="flex-1 flex flex-col">
            {selectedMail ? (
                <div className="flex-1 overflow-y-auto p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">{selectedMail.subject}</h2>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-500">差出人:</span>
                        <span className="text-sm text-gray-700">{selectedMail.from}</span>
                    </div>
                    <div className="flex item-center gap-2 mb-6">
                        <span className="text-sm text-gray-500">日時</span>
                        <span className="text-sm text-gray-700">
                            {new Date(selectedMail.date).toLocaleString('ja-JP')}
                        </span>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                            {selectedMail.body}
                        </pre>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                        <p className="text-lg mb-2">📧</p>
                        <p className="text-sm">メールを選択してください</p>
                    </div>
                </div>
            )}
        </div>
        </div>
    )
}

export default MailPage