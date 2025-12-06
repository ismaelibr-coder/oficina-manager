import { config } from '../config'
import { authService } from '../services/auth'

export class ApiClient {
    private baseUrl: string

    constructor() {
        this.baseUrl = config.apiUrl
    }

    private getHeaders(includeAuth: boolean = true): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        }

        if (includeAuth) {
            const token = authService.getToken()
            if (token) {
                headers['Authorization'] = `Bearer ${token}`
            }
        }

        return headers
    }

    async get<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'GET',
            headers: this.getHeaders(includeAuth),
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }))
            throw new Error(error.message || `HTTP ${response.status}`)
        }

        return response.json()
    }

    async post<T>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: this.getHeaders(includeAuth),
            body: data ? JSON.stringify(data) : undefined,
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }))
            throw new Error(error.message || `HTTP ${response.status}`)
        }

        return response.json()
    }

    async put<T>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PUT',
            headers: this.getHeaders(includeAuth),
            body: data ? JSON.stringify(data) : undefined,
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }))
            throw new Error(error.message || `HTTP ${response.status}`)
        }

        return response.json()
    }

    async delete<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'DELETE',
            headers: this.getHeaders(includeAuth),
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }))
            throw new Error(error.message || `HTTP ${response.status}`)
        }

        return response.json()
    }

    async patch<T>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PATCH',
            headers: this.getHeaders(includeAuth),
            body: data ? JSON.stringify(data) : undefined,
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }))
            throw new Error(error.message || `HTTP ${response.status}`)
        }

        return response.json()
    }
}

export const apiClient = new ApiClient()
