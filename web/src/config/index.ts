// Configuração da API
// Em produção, sempre usa a URL do Render
// Em desenvolvimento local, mude manualmente para http://localhost:3001/api
// Em produção, usa a URL do ambiente ou a fixa do Render
// Em desenvolvimento local, usa localhost se não houver variável definida
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://oficina-manager.onrender.com/api'

export const config = {
    apiUrl: API_URL,
}
