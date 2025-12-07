import { config } from '@/config'
import { authService } from './auth'

export interface PaginatedResponse<T> {
    data: T[]
    pagination: {
        page: number
        pageSize: number
        total: number
        totalPages: number
    }
}

/**
 * Generic pagination hook/helper for API calls
 * Handles both paginated and non-paginated responses
 */
export async function fetchPaginated<T>(
    endpoint: string,
    page: number = 1,
    pageSize: number = 20,
    additionalParams?: Record<string, string>
): Promise<PaginatedResponse<T>> {
    const params = new URLSearchParams()
    params.append('page', page.toString())
    params.append('pageSize', pageSize.toString())

    if (additionalParams) {
        Object.entries(additionalParams).forEach(([key, value]) => {
            if (value) params.append(key, value)
        })
    }

    const url = `${config.apiUrl}${endpoint}?${params.toString()}`

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${authService.getToken()}`,
            'Content-Type': 'application/json'
        }
    })

    if (!response.ok) {
        throw new Error('Erro ao carregar dados')
    }

    const json = await response.json()

    // Handle paginated response
    if (json.data && json.pagination) {
        return json as PaginatedResponse<T>
    }

    // Handle non-paginated (legacy) - convert to paginated format
    const data = Array.isArray(json) ? json : []
    return {
        data,
        pagination: {
            page: 1,
            pageSize: data.length,
            total: data.length,
            totalPages: 1
        }
    }
}
