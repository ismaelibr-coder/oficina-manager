import { authService } from './auth'
import { config } from '@/config'

export interface ChecklistItem {
    id: string
    name: string
    status: 'NOT_CHECKED' | 'OK' | 'ATTENTION' | 'CRITICAL'
    notes?: string
    photos?: string[]
    order: number
}

export interface Checklist {
    id: string
    appointmentId: string
    mechanicId: string
    notes?: string
    items: ChecklistItem[]
    createdAt: string
}

export interface CreateChecklistData {
    appointmentId: string
    templateId?: string
}

export interface UpdateChecklistItemData {
    status?: 'NOT_CHECKED' | 'OK' | 'ATTENTION' | 'CRITICAL'
    notes?: string
    photos?: string[]
}

class ChecklistsService {
    private getHeaders() {
        const token = authService.getToken()
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    }

    async getByAppointmentId(appointmentId: string): Promise<Checklist> {
        const response = await fetch(`${config.apiUrl}/checklists/appointment/${appointmentId}`, {
            headers: this.getHeaders(),
        })

        if (response.status === 404) {
            throw new Error('Checklist não encontrado')
        }

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao buscar checklist')
        }

        return response.json()
    }

    async create(data: CreateChecklistData): Promise<Checklist> {
        const response = await fetch(`${config.apiUrl}/checklists`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao criar checklist')
        }

        return response.json()
    }

    async updateItem(itemId: string, data: UpdateChecklistItemData): Promise<ChecklistItem> {
        const response = await fetch(`${config.apiUrl}/checklists/items/${itemId}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao atualizar item')
        }

        return response.json()
    }
    async uploadPhoto(file: File): Promise<string> {
        const formData = new FormData()
        formData.append('file', file)

        const token = authService.getToken()
        const response = await fetch(`${config.apiUrl}/uploads`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao fazer upload da foto')
        }

        const data = await response.json()
        return data.url
    }
}

export const checklistsService = new ChecklistsService()
