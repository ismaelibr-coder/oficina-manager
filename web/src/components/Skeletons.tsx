export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="animate-pulse">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <th key={i} className="px-6 py-3">
                                    <div className="h-4 bg-gray-300 rounded w-20"></div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {Array.from({ length: rows }).map((_, i) => (
                            <tr key={i}>
                                {[1, 2, 3, 4, 5].map((j) => (
                                    <td key={j} className="px-6 py-4">
                                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export function CardSkeleton() {
    return (
        <div className="animate-pulse bg-white rounded-lg shadow p-6">
            <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
            <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
        </div>
    )
}

export function ListSkeleton({ items = 5 }: { items?: number }) {
    return (
        <div className="animate-pulse space-y-4">
            {Array.from({ length: items }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
