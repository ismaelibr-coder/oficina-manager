'use client'

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

export interface PaginationProps {
    currentPage: number
    totalPages: number
    pageSize: number
    totalItems: number
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
    pageSizeOptions?: number[]
}

export function Pagination({
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 50, 100]
}: PaginationProps) {
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
    const endItem = Math.min(currentPage * pageSize, totalItems)

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1)
        }
    }

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1)
        }
    }

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newPageSize = parseInt(e.target.value)
        onPageSizeChange(newPageSize)
        // Reset to first page when changing page size
        onPageChange(1)
    }

    if (totalItems === 0) {
        return (
            <div className="flex items-center justify-center py-4 text-sm text-gray-500">
                Nenhum resultado encontrado
            </div>
        )
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2">
            {/* Result count and page size selector */}
            <div className="flex items-center gap-4 text-sm text-gray-700">
                <span className="whitespace-nowrap">
                    Mostrando <span className="font-semibold">{startItem}</span> a{' '}
                    <span className="font-semibold">{endItem}</span> de{' '}
                    <span className="font-semibold">{totalItems}</span> resultados
                </span>

                <div className="flex items-center gap-2">
                    <label htmlFor="pageSize" className="whitespace-nowrap text-gray-600">
                        Por página:
                    </label>
                    <select
                        id="pageSize"
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        {pageSizeOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-2">
                <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className={`
                        flex items-center gap-1 px-3 py-2 rounded-lg font-medium text-sm transition-all
                        ${currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 active:scale-95'
                        }
                    `}
                >
                    <ChevronLeftIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Anterior</span>
                </button>

                {/* Page indicator */}
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-sm font-semibold text-gray-700">
                        Página {currentPage} de {totalPages}
                    </span>
                </div>

                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className={`
                        flex items-center gap-1 px-3 py-2 rounded-lg font-medium text-sm transition-all
                        ${currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 active:scale-95'
                        }
                    `}
                >
                    <span className="hidden sm:inline">Próximo</span>
                    <ChevronRightIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
