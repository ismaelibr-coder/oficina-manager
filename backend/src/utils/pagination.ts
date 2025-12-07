export interface PaginationParams {
    page?: number
    pageSize?: number
}

export interface PaginationResult<T> {
    data: T[]
    pagination: {
        page: number
        pageSize: number
        total: number
        totalPages: number
    }
}

export interface PaginationOptions {
    defaultPageSize?: number
    maxPageSize?: number
}

/**
 * Parse pagination parameters from query string
 * @param query - Express request query object
 * @param options - Optional pagination configuration
 * @returns Validated pagination parameters with skip and take values for Prisma
 */
export function getPaginationParams(
    query: any,
    options: PaginationOptions = {}
): { page: number; pageSize: number; skip: number; take: number } {
    const defaultPageSize = options.defaultPageSize || 50
    const maxPageSize = options.maxPageSize || 100

    // Parse and validate page number
    let page = parseInt(query.page) || 1
    if (page < 1) page = 1

    // Parse and validate page size
    let pageSize = parseInt(query.pageSize) || defaultPageSize
    if (pageSize < 1) pageSize = defaultPageSize
    if (pageSize > maxPageSize) pageSize = maxPageSize

    // Calculate skip and take for Prisma
    const skip = (page - 1) * pageSize
    const take = pageSize

    return { page, pageSize, skip, take }
}

/**
 * Build pagination result object
 * @param data - Array of data items
 * @param total - Total count of all items (before pagination)
 * @param page - Current page number
 * @param pageSize - Items per page
 * @returns Formatted pagination result
 */
export function buildPaginationResult<T>(
    data: T[],
    total: number,
    page: number,
    pageSize: number
): PaginationResult<T> {
    const totalPages = Math.ceil(total / pageSize)

    return {
        data,
        pagination: {
            page,
            pageSize,
            total,
            totalPages
        }
    }
}
