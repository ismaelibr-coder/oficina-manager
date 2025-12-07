import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.middleware'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { sendEmail, appointmentConfirmationTemplate, appointmentRescheduledTemplate } from '../services/email.service'

const prisma = new PrismaClient()

// Helper function to safely send emails
async function trySendEmail(to: string | undefined, subject: string, html: string) {
    if (!to || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log('Email not sent: missing configuration or recipient email')
        return
    }

    try {
        await sendEmail({ to, subject, html })
        console.log(`Email sent successfully to ${to}`)
    } catch (error) {
        console.error('Failed to send email:', error)
        // Don't throw - email failure shouldn't break the API
    }
}

export class AppointmentsController {
// ... (rest of the code stays the same until create method)
