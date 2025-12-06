import { authService } from './auth'

export interface User {
    id: string
    name: string
    email: string
    role: 'ADMIN' | 'MECHANIC'
    active: boolean
    createdAt?: string
    updatedAt?: string
}

export interface CreateUserData {
    name: string
    email: string
    password: string
    role?: 'ADMIN' | 'MECHANIC'
}

export interface UpdateUserData {
    name?: string
    email?: string
    password?: string
    role?: 'ADMIN' | 'MECHANIC'
    active?: boolean
}

class UsersService {
    private getHeaders() {
        const token = authService.getToken()
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    }

    async list(): Promise<User[]> {
        const response = await fetch('http://localhost:3001/api/users', {
            headers: this.getHeaders(),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao listar usuários')
        }

        return response.json()
    }

    async getById(id: string): Promise<User> {
        const response = await fetch(`http://localhost:3001/api/users/${id}`, {
            headers: this.getHeaders(),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao buscar usuário')
        }

        return response.json()
    }

    async create(data: CreateUserData): Promise<User> {
        const response = await fetch('http://localhost:3001/api/users', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao criar usuário')
        }

        return response.json()
    }

    async update(id: string, data: UpdateUserData): Promise<User> {
        const response = await fetch(`http://localhost:3001/api/users/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao atualizar usuário')
        }

        return response.json()
    }

    async delete(id: string): Promise<void> {
        const response = await fetch(`http://localhost:3001/api/users/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao excluir usuário')
        }
    }
}

export const usersService = new UsersService()
