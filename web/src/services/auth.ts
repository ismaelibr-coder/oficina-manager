import { config } from '@/config'

export interface LoginCredentials {
    email: string
    password: string
}

export interface User {
    id: string
    name: string
    email: string
    role: string
}

export interface AuthResponse {
    user: User
    token: string
}

class AuthService {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await fetch(`${config.apiUrl}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao fazer login')
        }

        const data: AuthResponse = await response.json()

        // Salvar token no localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))
        }

        return data
    }

    logout() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
        }
    }

    getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token')
        }
        return null
    }

    getUser(): User | null {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user')
            return userStr ? JSON.parse(userStr) : null
        }
        return null
    }

    isAuthenticated(): boolean {
        return !!this.getToken()
    }
}

export const authService = new AuthService()
