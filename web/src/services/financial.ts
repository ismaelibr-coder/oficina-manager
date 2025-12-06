import { authService } from './auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export interface DashboardStats {
    monthlyRevenue: number
    pendingPayments: number
    pendingPaymentsCount: number
    averageTicket: number
    completedOrders: number
}

export interface RevenueData {
    date: string
    revenue: number
}

export interface TopService {
    name: string
    total: number
    count: number
}

export interface TopProduct {
    name: string
    total: number
    quantity: number
}

export interface ServiceVsProduct {
    name: string
    value: number
}

export interface PendingPayment {
    id: string
    orderNumber: string
    total: number
    status: string
    createdAt: string
    vehicle: {
        plate: string
        model: string
        brand: string
    }
    appointment: {
        customer: {
            name: string
            phone: string
        }
    }
}

export interface PendingPaymentsResponse {
    serviceOrders: PendingPayment[]
    totalPending: number
    count: number
}

class FinancialService {
    private getAuthHeaders() {
        const token = authService.getToken()
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        }
    }

    async getDashboardStats(): Promise<DashboardStats> {
        const response = await fetch(`${API_URL}/financial/dashboard-stats`, {
            headers: this.getAuthHeaders(),
        })

        if (!response.ok) {
            throw new Error('Erro ao buscar estatísticas do dashboard')
        }

        return response.json()
    }

    async getRevenueByPeriod(startDate?: string, endDate?: string): Promise<RevenueData[]> {
        const params = new URLSearchParams()
        if (startDate) params.append('startDate', startDate)
        if (endDate) params.append('endDate', endDate)

        const response = await fetch(`${API_URL}/financial/revenue-by-period?${params}`, {
            headers: this.getAuthHeaders(),
        })

        if (!response.ok) {
            throw new Error('Erro ao buscar faturamento por período')
        }

        return response.json()
    }

    async getTopServices(limit: number = 5): Promise<TopService[]> {
        const response = await fetch(`${API_URL}/financial/top-services?limit=${limit}`, {
            headers: this.getAuthHeaders(),
        })

        if (!response.ok) {
            throw new Error('Erro ao buscar top serviços')
        }

        return response.json()
    }

    async getTopProducts(limit: number = 5): Promise<TopProduct[]> {
        const response = await fetch(`${API_URL}/financial/top-products?limit=${limit}`, {
            headers: this.getAuthHeaders(),
        })

        if (!response.ok) {
            throw new Error('Erro ao buscar top produtos')
        }

        return response.json()
    }

    async getPendingPayments(): Promise<PendingPaymentsResponse> {
        const response = await fetch(`${API_URL}/financial/pending-payments`, {
            headers: this.getAuthHeaders(),
        })

        if (!response.ok) {
            throw new Error('Erro ao buscar pagamentos pendentes')
        }

        return response.json()
    }

    async getServicesVsProducts(startDate?: string, endDate?: string): Promise<ServiceVsProduct[]> {
        const params = new URLSearchParams()
        if (startDate) params.append('startDate', startDate)
        if (endDate) params.append('endDate', endDate)

        const response = await fetch(`${API_URL}/financial/services-vs-products?${params}`, {
            headers: this.getAuthHeaders(),
        })

        if (!response.ok) {
            throw new Error('Erro ao buscar comparação serviços vs produtos')
        }

        return response.json()
    }
}

export const financialService = new FinancialService()
