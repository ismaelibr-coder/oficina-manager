export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-3 py-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white p-6 rounded-lg shadow">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
            ))}
        </div>
    )
}

export function ListSkeleton({ items = 10 }: { items?: number }) {
    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="divide-y divide-gray-200">
                {Array.from({ length: items }).map((_, i) => (
                    <div key={i} className="p-4 animate-pulse">
                        <div className="flex items-center space-x-4">
                            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
