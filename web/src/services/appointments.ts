import { authService } from './auth'
import { config } from '@/config'

export interface Appointment {
    id: string
    customerId: string
    vehicleId: string
    boxId: string
    scheduledStart: string
    scheduledEnd: string
    status: 'SCHEDULED' | 'CHECKED_IN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED'
    description?: string
    notes?: string
    customer?: {
        id: string
        name: string
        phone: string
    }
    vehicle?: {
        id: string
        plate: string
        model: string
        brand?: string
    }
    box?: {
        id: string
        name: string
    }
    serviceOrder?: {
        mechanicId: string
    }
}

export interface CreateAppointmentData {
    customerId: string
    vehicleId: string
    boxId: string
    scheduledStart: string
    scheduledEnd: string
    description?: string
    notes?: string
}

class AppointmentsService {
    private getHeaders() {
        const token = authService.getToken()
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    }

    async list(filters?: { start?: string; end?: string; status?: string; customerId?: string; vehicleId?: string }): Promise<Appointment[]> {
        const params = new URLSearchParams()
        if (filters) {
            if (filters.start) params.append('start', filters.start)
            if (filters.end) params.append('end', filters.end)
            if (filters.status) params.append('status', filters.status)
            if (filters.customerId) params.append('customerId', filters.customerId)
            if (filters.vehicleId) params.append('vehicleId', filters.vehicleId)
        }

        const url = params.toString()
            ? `${config.apiUrl}/appointments?${params}`
            : `${config.apiUrl}/appointments`

        const response = await fetch(url, {
            headers: this.getHeaders(),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao listar agendamentos')
        }

        return response.json()
    }

    async getById(id: string): Promise<Appointment> {
        const response = await fetch(`${config.apiUrl}/appointments/${id}`, {
            headers: this.getHeaders(),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao buscar agendamento')
        }

        return response.json()
    }

    async create(data: CreateAppointmentData): Promise<Appointment> {
        const response = await fetch(`${config.apiUrl}/appointments`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao criar agendamento')
        }

        return response.json()
    }

    async update(id: string, data: Partial<CreateAppointmentData> & { status?: string }): Promise<Appointment> {
        const response = await fetch(`${config.apiUrl}/appointments/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao atualizar agendamento')
        }

        return response.json()
    }

    async checkConflicts(data: { id?: string; boxId: string; scheduledStart: string; scheduledEnd: string }): Promise<{ hasConflicts: boolean; boxConflicts: any[]; mechanicConflicts: any[] }> {
        const response = await fetch(`${config.apiUrl}/appointments/conflicts`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao verificar conflitos')
        }

        return response.json()
    }

    async simulateCascade(data: { id?: string; boxId: string; scheduledStart: string; scheduledEnd: string }): Promise<any[]> {
        const response = await fetch(`${config.apiUrl}/appointments/simulate-cascade`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao simular cascata')
        }

        return response.json()
    }

    async batchUpdate(moves: any[]): Promise<void> {
        const response = await fetch(`${config.apiUrl}/appointments/batch-update`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ moves }),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao aplicar atualizações em lote')
        }
    }

    async delete(id: string): Promise<void> {
        const response = await fetch(`${config.apiUrl}/appointments/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao cancelar agendamento')
        }
    }
}

export const appointmentsService = new AppointmentsService()
