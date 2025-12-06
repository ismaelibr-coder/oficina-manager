import { authService } from './auth'
import { Product } from './products'
import { Service } from './services'
import { config } from '@/config'

export interface ServiceOrderItem {
    id: string
    type: 'PRODUCT' | 'SERVICE'
    productId?: string
    serviceId?: string
    description: string
    quantity: number
    unitPrice: number
    total: number
    product?: Product
    service?: Service
}

export interface ServiceOrder {
    id: string
    orderNumber: string
    appointmentId: string
    vehicleId: string
    mechanicId: string
    status: 'PENDING' | 'IN_PROGRESS' | 'AWAITING_APPROVAL' | 'APPROVED' | 'COMPLETED' | 'CANCELLED'
    subtotal: number
    discount: number
    total: number
    approvedAt?: string
    completedAt?: string
    notes?: string
    createdAt: string
    customer?: {
        id: string
        name: string
    }
    vehicle?: {
        id: string
        plate: string
        model: string
    }
    mechanic?: {
        id: string
        name: string
    }
    items?: ServiceOrderItem[]
    appointment?: {
        customer?: {
            id: string
            name: string
        }
    }
}

export interface AddItemData {
    type: 'PRODUCT' | 'SERVICE'
    productId?: string
    serviceId?: string
    quantity: number
    unitPrice?: number
    description?: string
}

class ServiceOrdersService {
    private getHeaders() {
        const token = authService.getToken()
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    }

    async list(status?: string): Promise<ServiceOrder[]> {
        const url = status
            ? `${config.apiUrl}/service-orders?status=${status}`
            : `${config.apiUrl}/service-orders`

        const response = await fetch(url, {
            headers: this.getHeaders(),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao listar OS')
        }

        return response.json()
    }

    async getById(id: string): Promise<ServiceOrder> {
        const response = await fetch(`${config.apiUrl}/service-orders/${id}`, {
            headers: this.getHeaders(),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao buscar OS')
        }

        return response.json()
    }

    async create(appointmentId: string): Promise<ServiceOrder> {
        const response = await fetch(`${config.apiUrl}/service-orders`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ appointmentId }),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao criar OS')
        }

        return response.json()
    }

    async addItem(id: string, data: AddItemData): Promise<void> {
        const response = await fetch(`${config.apiUrl}/service-orders/${id}/items`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao adicionar item')
        }
    }

    async removeItem(id: string, itemId: string): Promise<void> {
        const response = await fetch(`${config.apiUrl}/service-orders/${id}/items/${itemId}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao remover item')
        }
    }

    async updateStatus(id: string, status: string): Promise<ServiceOrder> {
        const response = await fetch(`${config.apiUrl}/service-orders/${id}/status`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify({ status }),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao atualizar status')
        }

        return response.json()
    }
}

export const serviceOrdersService = new ServiceOrdersService()
