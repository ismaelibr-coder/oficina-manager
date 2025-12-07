'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function ResetPasswordPage() {
    const router = useRouter()
    const params = useParams()
    const token = params.token as string

    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage('')

        if (newPassword.length < 6) {
            setMessage('Senha deve ter no mínimo 6 caracteres')
            return
        }

        if (newPassword !== confirmPassword) {
            setMessage('As senhas não coincidem')
            return
        }

        setLoading(true)

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword })
            })

            const data = await response.json()
            setMessage(data.message)

            if (response.ok) {
                setSuccess(true)
                setTimeout(() => router.push('/'), 3000)
            }
        } catch (error) {
            setMessage('Erro ao resetar senha')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Redefinir Senha</h1>
                    <p className="text-gray-600">Digite sua nova senha</p>
                </div>

                {success ? (
                    <div className="bg-green-50 text-green-700 p-6 rounded-lg border border-green-200 text-center">
                        <div className="text-4xl mb-3">✅</div>
                        <p className="font-medium">Senha alterada com sucesso!</p>
                        <p className="text-sm mt-2">Redirecionando para login...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nova Senha
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                placeholder="Mínimo 6 caracteres"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirmar Senha
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                placeholder="Digite novamente"
                            />
                        </div>

                        {message && (
                            <div className={`p-4 rounded-lg ${message.includes('sucesso') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                        >
                            {loading ? 'Alterando...' : 'Alterar Senha'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
