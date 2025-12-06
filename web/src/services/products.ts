import { authService } from './auth'

export interface Product {
    id: string
    name: string
    code?: string
    description?: string
    costPrice: number
    salePrice: number
    stock: number
    minStock: number
    supplier?: string
    active: boolean
}

export interface CreateProductData {
    name: string
    code?: string
    description?: string
    costPrice?: number
    salePrice: number
    stock?: number
    minStock?: number
    supplier?: string
}

class ProductsService {
    private getHeaders() {
        const token = authService.getToken()
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    }

    async list(search?: string): Promise<Product[]> {
        const url = search
            ? `http://localhost:3001/api/products?search=${encodeURIComponent(search)}`
            : 'http://localhost:3001/api/products'

        const response = await fetch(url, {
            headers: this.getHeaders(),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao listar produtos')
        }

        return response.json()
    }

    async getById(id: string): Promise<Product> {
        const response = await fetch(`http://localhost:3001/api/products/${id}`, {
            headers: this.getHeaders(),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao buscar produto')
        }

        return response.json()
    }

    async create(data: CreateProductData): Promise<Product> {
        const response = await fetch('http://localhost:3001/api/products', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao criar produto')
        }

        return response.json()
    }

    async update(id: string, data: Partial<CreateProductData>): Promise<Product> {
        const response = await fetch(`http://localhost:3001/api/products/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao atualizar produto')
        }

        return response.json()
    }

    async delete(id: string): Promise<void> {
        const response = await fetch(`http://localhost:3001/api/products/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erro ao excluir produto')
        }
    }
}

export const productsService = new ProductsService()
