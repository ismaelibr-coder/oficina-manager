import { ReactNode } from 'react'
import { useIsMobile } from '@/hooks/useIsMobile'

interface Column<T> {
    key: string
    header: string
    render: (item: T) => ReactNode
}

interface ResponsiveTableProps<T> {
    data: T[]
    columns: Column<T>[]
    renderMobileCard: (item: T) => ReactNode
    keyExtractor: (item: T) => string
}

export function ResponsiveTable<T>({
    data,
    columns,
    renderMobileCard,
    keyExtractor
}: ResponsiveTableProps<T>) {
    const isMobile = useIsMobile()

    if (isMobile) {
        return (
            <div className="space-y-4">
                {data.map((item) => (
                    <div key={keyExtractor(item)}>
                        {renderMobileCard(item)}
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item) => (
                        <tr key={keyExtractor(item)} className="hover:bg-gray-50">
                            {columns.map((column) => (
                                <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                                    {column.render(item)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
