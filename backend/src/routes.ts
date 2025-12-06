import { Router } from 'express'
import { AuthController } from './controllers/auth.controller'
import { UsersController } from './controllers/users.controller'
import { CustomersController } from './controllers/customers.controller'
import { VehiclesController } from './controllers/vehicles.controller'
import { BoxesController } from './controllers/boxes.controller'
import { AppointmentsController } from './controllers/appointments.controller'
import { ProductsController } from './controllers/products.controller'
import { ServicesController } from './controllers/services.controller'
import { ServiceOrdersController } from './controllers/service-orders.controller'
import { ChecklistTemplatesController } from './controllers/checklist-templates.controller'
import { ChecklistsController } from './controllers/checklists.controller'
import { MaintenanceAlertsController } from './controllers/maintenance-alerts.controller'
import { FinancialController } from './controllers/financial.controller'
import { ReportsController } from './controllers/reports.controller'
import { UploadsController } from './controllers/uploads.controller'
import { authMiddleware, adminMiddleware } from './middleware/auth.middleware'
import multer from 'multer'
import { uploadConfig } from './config/upload'

const router = Router()
const authController = new AuthController()
const usersController = new UsersController()
const customersController = new CustomersController()
const vehiclesController = new VehiclesController()
const boxesController = new BoxesController()
const appointmentsController = new AppointmentsController()
const productsController = new ProductsController()
const servicesController = new ServicesController()
const serviceOrdersController = new ServiceOrdersController()
const checklistTemplatesController = new ChecklistTemplatesController()
const checklistsController = new ChecklistsController()
const maintenanceAlertsController = new MaintenanceAlertsController()
const financialController = new FinancialController()
const reportsController = new ReportsController()
const uploadsController = new UploadsController()

const upload = multer(uploadConfig)

// Rotas de Autenticação
router.post('/auth/login', authController.login)

// Rotas de Usuários (protegidas)
router.get('/users', authMiddleware, adminMiddleware, usersController.list)
router.get('/users/:id', authMiddleware, adminMiddleware, usersController.getById)
router.post('/users', authMiddleware, adminMiddleware, usersController.create)
router.put('/users/:id', authMiddleware, adminMiddleware, usersController.update)
router.delete('/users/:id', authMiddleware, adminMiddleware, usersController.delete)

// Rotas de Clientes (protegidas)
router.get('/customers', authMiddleware, customersController.list)
router.get('/customers/:id', authMiddleware, customersController.getById)
router.post('/customers', authMiddleware, customersController.create)
router.put('/customers/:id', authMiddleware, customersController.update)
router.delete('/customers/:id', authMiddleware, customersController.delete)

// Rotas de Veículos (protegidas)
router.get('/vehicles', authMiddleware, vehiclesController.list)
router.get('/vehicles/:id', authMiddleware, vehiclesController.getById)
router.post('/vehicles', authMiddleware, vehiclesController.create)
router.put('/vehicles/:id', authMiddleware, vehiclesController.update)
router.delete('/vehicles/:id', authMiddleware, vehiclesController.delete)

// Rotas de Boxes (protegidas)
router.get('/boxes', authMiddleware, boxesController.list)
router.get('/boxes/:id', authMiddleware, boxesController.getById)
router.post('/boxes', authMiddleware, boxesController.create)
router.put('/boxes/:id', authMiddleware, boxesController.update)
router.delete('/boxes/:id', authMiddleware, boxesController.delete)

// Rotas de Agendamentos (protegidas)
router.get('/appointments', authMiddleware, appointmentsController.list)
router.get('/appointments/:id', authMiddleware, appointmentsController.getById)
router.post('/appointments', authMiddleware, appointmentsController.create)
router.put('/appointments/:id', authMiddleware, appointmentsController.update)
router.delete('/appointments/:id', authMiddleware, appointmentsController.delete)
router.post('/appointments/conflicts', authMiddleware, appointmentsController.checkConflicts)
router.post('/appointments/simulate-cascade', authMiddleware, appointmentsController.simulateCascade)
router.post('/appointments/batch-update', authMiddleware, appointmentsController.batchUpdate)

// Rotas de Produtos (protegidas)
router.get('/products', authMiddleware, productsController.list)
router.get('/products/:id', authMiddleware, productsController.getById)
router.post('/products', authMiddleware, productsController.create)
router.put('/products/:id', authMiddleware, productsController.update)
router.delete('/products/:id', authMiddleware, productsController.delete)

// Rotas de Serviços (protegidas)
router.get('/services', authMiddleware, servicesController.list)
router.get('/services/:id', authMiddleware, servicesController.getById)
router.post('/services', authMiddleware, servicesController.create)
router.put('/services/:id', authMiddleware, servicesController.update)
router.delete('/services/:id', authMiddleware, servicesController.delete)

// Rotas de Ordens de Serviço (protegidas)
router.get('/service-orders', authMiddleware, (req, res) => serviceOrdersController.list(req, res))
router.get('/service-orders/alerts', authMiddleware, (req, res) => serviceOrdersController.getInProgressAlerts(req, res))
router.get('/service-orders/:id', authMiddleware, (req, res) => serviceOrdersController.getById(req, res))
router.post('/service-orders', authMiddleware, (req, res) => serviceOrdersController.create(req, res))
router.post('/service-orders/:id/items', authMiddleware, (req, res) => serviceOrdersController.addItem(req, res))
router.delete('/service-orders/:id/items/:itemId', authMiddleware, (req, res) => serviceOrdersController.removeItem(req, res))
router.put('/service-orders/:id/status', authMiddleware, (req, res) => serviceOrdersController.updateStatus(req, res))

// Rotas de Templates de Checklist (protegidas)
router.get('/checklist-templates', authMiddleware, checklistTemplatesController.list)
router.get('/checklist-templates/:id', authMiddleware, checklistTemplatesController.getById)
router.post('/checklist-templates', authMiddleware, checklistTemplatesController.create)
router.put('/checklist-templates/:id', authMiddleware, checklistTemplatesController.update)
router.delete('/checklist-templates/:id', authMiddleware, checklistTemplatesController.delete)

// Rotas de Execução de Checklist (protegidas)
router.get('/checklists/appointment/:appointmentId', authMiddleware, checklistsController.getByAppointmentId)
router.post('/checklists', authMiddleware, checklistsController.create)
router.put('/checklists/items/:itemId', authMiddleware, checklistsController.updateItem)

// Rotas de Alertas de Manutenção (protegidas)
router.get('/maintenance-alerts', authMiddleware, maintenanceAlertsController.getUpcomingMaintenances)
router.get('/maintenance-alerts/by-date', authMiddleware, maintenanceAlertsController.getAlertsByDate)

// Rotas Financeiras (protegidas - apenas admin)
router.get('/financial/dashboard-stats', authMiddleware, adminMiddleware, financialController.getDashboardStats)
router.get('/financial/revenue', authMiddleware, adminMiddleware, financialController.getTotalRevenue)
router.get('/financial/revenue-by-period', authMiddleware, adminMiddleware, financialController.getRevenueByPeriod)
router.get('/financial/top-services', authMiddleware, adminMiddleware, financialController.getTopServices)
router.get('/financial/top-products', authMiddleware, adminMiddleware, financialController.getTopProducts)
router.get('/financial/pending-payments', authMiddleware, adminMiddleware, financialController.getPendingPayments)
router.get('/financial/services-vs-products', authMiddleware, adminMiddleware, financialController.getServicesVsProducts)

// Rotas de Relatórios (protegidas - apenas admin)
router.get('/reports/revenue', authMiddleware, adminMiddleware, reportsController.generateRevenueReport)
router.get('/reports/service-orders', authMiddleware, adminMiddleware, reportsController.generateServiceOrdersReport)
router.get('/reports/products', authMiddleware, adminMiddleware, reportsController.generateProductSalesReport)
router.get('/reports/services', authMiddleware, adminMiddleware, reportsController.generateServicesReport)
router.get('/reports/customers', authMiddleware, adminMiddleware, reportsController.generateCustomersReport)

// Rotas de Upload (protegidas)
router.post('/uploads', authMiddleware, upload.single('file'), uploadsController.upload)

export { router }
