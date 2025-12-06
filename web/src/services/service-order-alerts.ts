import { authService } from './auth'

export interface ServiceOrderAlert {
    id: string
    orderNumber: string
    status: string
    vehicle: {
        id: string
        plate: string
        model: string
        brand: string
    }
    customer?: {
        id: string
        name: string
        phone?: string
    }
    mechanic?: {
        id: string
        name: string
    }
    createdAt: string
    hoursInProgress: number
    daysInProgress: number
    alertLevel: 'critical' | 'warning' | 'info'
}

class ServiceOrderAlertsService {
    private getHeaders() {
        const token = authService.getToken()
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    }

    async getInProgressAlerts(): Promise<ServiceOrderAlert[]> {
        const response = await fetch('http://localhost:3001/api/service-orders/alerts', {
            headers: this.getHeaders(),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao buscar alertas de OS')
        }

        return response.json()
    }
}

export const serviceOrderAlertsService = new ServiceOrderAlertsService()
