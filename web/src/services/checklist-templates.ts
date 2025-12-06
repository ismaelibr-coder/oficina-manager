import { authService } from './auth'
import { config } from '@/config'

export interface ChecklistTemplateItem {
    id: string
    name: string
    order: number
}

export interface ChecklistTemplate {
    id: string
    name: string
    description?: string
    active: boolean
    items: ChecklistTemplateItem[]
}

export interface CreateChecklistTemplateData {
    name: string
    description?: string
    items: { name: string }[]
}

class ChecklistTemplatesService {
    private getHeaders() {
        const token = authService.getToken()
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    }

    async list(): Promise<ChecklistTemplate[]> {
        const response = await fetch(`${config.apiUrl}/checklist-templates`, {
            headers: this.getHeaders(),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao listar templates')
        }

        return response.json()
    }

    async getById(id: string): Promise<ChecklistTemplate> {
        const response = await fetch(`${config.apiUrl}/checklist-templates/${id}`, {
            headers: this.getHeaders(),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao buscar template')
        }

        return response.json()
    }

    async create(data: CreateChecklistTemplateData): Promise<ChecklistTemplate> {
        const response = await fetch(`${config.apiUrl}/checklist-templates`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao criar template')
        }

        return response.json()
    }

    async update(id: string, data: CreateChecklistTemplateData): Promise<ChecklistTemplate> {
        const response = await fetch(`${config.apiUrl}/checklist-templates/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao atualizar template')
        }

        return response.json()
    }

    async delete(id: string): Promise<void> {
        const response = await fetch(`${config.apiUrl}/checklist-templates/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao excluir template')
        }
    }
}

export const checklistTemplatesService = new ChecklistTemplatesService()
