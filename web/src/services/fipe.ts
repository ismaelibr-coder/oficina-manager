// Serviço para integração com API FIPE
const FIPE_API_URL = 'https://parallelum.com.br/fipe/api/v1'

export interface FipeBrand {
    codigo: string
    nome: string
}

export interface FipeModel {
    codigo: number
    nome: string
}

export interface FipeModelsResponse {
    modelos: FipeModel[]
    anos: any[]
}

class FipeService {
    async getBrands(): Promise<FipeBrand[]> {
        try {
            const response = await fetch(`${FIPE_API_URL}/carros/marcas`)
            if (!response.ok) throw new Error('Erro ao buscar marcas')
            return response.json()
        } catch (error) {
            console.error('Erro ao buscar marcas FIPE:', error)
            return []
        }
    }

    async getModels(brandCode: string): Promise<FipeModel[]> {
        try {
            const response = await fetch(`${FIPE_API_URL}/carros/marcas/${brandCode}/modelos`)
            if (!response.ok) throw new Error('Erro ao buscar modelos')
            const data: FipeModelsResponse = await response.json()
            return data.modelos
        } catch (error) {
            console.error('Erro ao buscar modelos FIPE:', error)
            return []
        }
    }
}

export const fipeService = new FipeService()
