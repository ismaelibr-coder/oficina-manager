// Em produção, usa a URL do ambiente ou a fixa do Render
// Garante que a URL termine com /api para evitar erros 404
let API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://oficina-manager.onrender.com/api'

if (API_URL && !API_URL.endsWith('/api')) {
    API_URL = `${API_URL}/api`
}

export { API_URL }

export const config = {
    apiUrl: API_URL,
}
