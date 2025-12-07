import nodemailer from 'nodemailer'

// Configurar transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // App Password do Gmail
    }
})

export interface EmailOptions {
    to: string
    subject: string
    html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
    try {
        await transporter.sendMail({
            from: `"Oficina Manager" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        })
        console.log(`Email enviado para ${to}`)
    } catch (error) {
        console.error('Erro ao enviar email:', error)
        throw new Error('Falha ao enviar email')
    }
}

// Template de recuperação de senha
export function passwordResetTemplate(resetUrl: string, userName: string) {
    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px 20px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Recuperação de Senha</h1>
        </div>
        <div class="content">
            <p>Olá ${userName},</p>
            <p>Recebemos uma solicitação para redefinir sua senha no <strong>Oficina Manager</strong>.</p>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Redefinir Senha</a>
            </div>
            <p><strong>Este link expira em 1 hora.</strong></p>
            <p>Se você não solicitou esta alteração, ignore este email. Sua senha permanecerá inalterada.</p>
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
                Ou copie e cole este link no navegador:<br>
                ${resetUrl}
            </p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Oficina Manager. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>
    `
}

// Template de confirmação de agendamento
export function appointmentConfirmationTemplate(data: {
    customerName: string
    date: string
    time: string
    vehicle: string
    box: string
}) {
    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10B981; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px 20px; border-radius: 0 0 8px 8px; }
        .info-box { background: white; padding: 15px; border-left: 4px solid #10B981; margin: 15px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Agendamento Confirmado!</h1>
        </div>
        <div class="content">
            <p>Olá ${data.customerName},</p>
            <p>Seu agendamento foi confirmado com sucesso!</p>
            <div class="info-box">
                <p><strong>📅 Data:</strong> ${data.date}</p>
                <p><strong>🕐 Horário:</strong> ${data.time}</p>
                <p><strong>🚗 Veículo:</strong> ${data.vehicle}</p>
                <p><strong>🔧 Box:</strong> ${data.box}</p>
            </div>
            <p>Aguardamos você! Caso precise reagendar, entre em contato conosco.</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Oficina Manager</p>
        </div>
    </div>
</body>
</html>
    `
}

// Template de reagendamento
export function appointmentRescheduledTemplate(data: {
    customerName: string
    oldDate: string
    oldTime: string
    newDate: string
    newTime: string
    vehicle: string
    box: string
}) {
    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #F59E0B; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px 20px; border-radius: 0 0 8px 8px; }
        .info-box { background: white; padding: 15px; border-left: 4px solid #F59E0B; margin: 15px 0; }
        .old-info { text-decoration: line-through; color: #999; }
        .new-info { color: #F59E0B; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔄 Agendamento Reagendado</h1>
        </div>
        <div class="content">
            <p>Olá ${data.customerName},</p>
            <p>Seu agendamento foi reagendado:</p>
            <div class="info-box">
                <p class="old-info">📅 Data anterior: ${data.oldDate} às ${data.oldTime}</p>
                <p class="new-info">📅 Nova data: ${data.newDate} às ${data.newTime}</p>
                <p><strong>🚗 Veículo:</strong> ${data.vehicle}</p>
                <p><strong>🔧 Box:</strong> ${data.box}</p>
            </div>
            <p>Nos vemos na nova data! Qualquer dúvida, entre em contato.</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Oficina Manager</p>
        </div>
    </div>
</body>
</html>
    `
}
