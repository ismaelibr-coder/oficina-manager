import { authService } from './auth'

export interface MaintenanceAlert {
    vehicleId: string
    plate: string
    brand: string
    model: string
    year: number
    currentKm: number
    nextMaintenanceKm?: number | null
    nextMaintenanceDate?: string | null
    customer: {
        id: string
        name: string
        phone?: string
    }
    status: 'overdue' | 'urgent' | 'upcoming' | 'ok'
    daysUntilMaintenance: number | null
    kmUntilMaintenance: number | null
    alertType: 'date' | 'km' | 'both' | null
}

class MaintenanceAlertsService {
    private getHeaders() {
        const token = authService.getToken()
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    }

    async getUpcomingMaintenances(daysAhead: number = 30): Promise<MaintenanceAlert[]> {
        const response = await fetch(`http://localhost:3001/api/maintenance-alerts?daysAhead=${daysAhead}`, {
            headers: this.getHeaders(),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao buscar alertas de manutenção')
        }

        return response.json()
    }

    async getAlertsByDate(date: string): Promise<any[]> {
        const response = await fetch(`http://localhost:3001/api/maintenance-alerts/by-date?date=${date}`, {
            headers: this.getHeaders(),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao buscar alertas por data')
        }

        return response.json()
    }
}

export const maintenanceAlertsService = new MaintenanceAlertsService()
