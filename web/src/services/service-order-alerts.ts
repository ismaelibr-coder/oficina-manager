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
        console.log('[ServiceOrderAlerts] Fetching in-progress alerts...')
        try {
            const result = await apiClient.get<ServiceOrderAlert[]>('/service-orders/alerts')
            console.log('[ServiceOrderAlerts] Success:', result.length, 'alerts found')
            return result
        } catch (error) {
            console.error('[ServiceOrderAlerts] Error fetching alerts:', error)
            throw error
        }
    }
}

export const serviceOrderAlertsService = new ServiceOrderAlertsService()
