import { apiClient } from '@/lib/api-client'

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
    async getInProgressAlerts(): Promise<ServiceOrderAlert[]> {
        return apiClient.get<ServiceOrderAlert[]>('/service-orders/alerts')
    }
}

export const serviceOrderAlertsService = new ServiceOrderAlertsService()
