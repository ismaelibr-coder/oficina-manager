import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class DiagnosticsController {
    async check(req: Request, res: Response) {
        try {
            const usersCount = await prisma.user.count()
            const customersCount = await prisma.customer.count()
            const vehiclesCount = await prisma.vehicle.count()
            const servicesCount = await prisma.service.count()
            const productsCount = await prisma.product.count()
            const appointmentsCount = await prisma.appointment.count()
            const serviceOrdersCount = await prisma.serviceOrder.count()

            const lastCustomer = await prisma.customer.findFirst({ orderBy: { createdAt: 'desc' } })
            const lastOS = await prisma.serviceOrder.findFirst({ orderBy: { createdAt: 'desc' } })

            return res.json({
                status: 'OK',
                timestamp: new Date(),
                counts: {
                    users: usersCount,
                    customers: customersCount,
                    vehicles: vehiclesCount,
                    services: servicesCount,
                    products: productsCount,
                    appointments: appointmentsCount,
                    serviceOrders: serviceOrdersCount
                },
                samples: {
                    lastCustomer: lastCustomer?.name || 'None',
                    lastOS: lastOS?.orderNumber || 'None'
                }
            })
        } catch (error: any) {
            return res.status(500).json({
                status: 'ERROR',
                message: error.message,
                stack: error.stack
            })
        }
    }
}
