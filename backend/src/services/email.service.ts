import nodemailer from 'nodemailer'

// Configurar transporter baseado nas variáveis de ambiente
// Se SENDGRID_API_KEY estiver presente, usa SendGrid
// Caso contrário, usa Gmail (para desenvolvimento local)
const transporter = process.env.SENDGRID_API_KEY
    ? nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY
        }
    })
    : nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    })

export interface EmailOptions {
    to: string
    subject: string
    html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
    try {
        const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@oficina.com'
        const fromName = process.env.EMAIL_FROM_NAME || 'Oficina Manager'

        await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
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
            <h1>Recuperação de Senha</h1>
        </div>
        <div class="content">
            <p>Olá ${userName},</p>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Redefinir Senha</a>
            </div>
            <p>Ou copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; color: #4F46E5;">${resetUrl}</p>
            <p><strong>Este link expira em 1 hora.</strong></p>
            <p>Se você não solicitou esta redefinição, ignore este email.</p>
        </div>
        <div class="footer">
            <p>© 2024 Oficina Manager. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>
    `
}

// Template de boas-vindas
export function welcomeTemplate(userName: string, tempPassword: string) {
    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px 20px; border-radius: 0 0 8px 8px; }
        .credentials { background: white; padding: 15px; border-left: 4px solid #4F46E5; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Bem-vindo ao Oficina Manager!</h1>
        </div>
        <div class="content">
            <p>Olá ${userName},</p>
            <p>Sua conta foi criada com sucesso! Aqui estão suas credenciais de acesso:</p>
            <div class="credentials">
                <p><strong>Senha temporária:</strong> ${tempPassword}</p>
            </div>
            <p><strong>⚠️ Importante:</strong> Por favor, altere sua senha no primeiro acesso.</p>
            <p>Acesse o sistema e comece a gerenciar sua oficina de forma eficiente!</p>
        </div>
        <div class="footer">
            <p>© 2024 Oficina Manager. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>
    `
}

// Template de agendamento confirmado
export function appointmentConfirmedTemplate(
    customerName: string,
    vehiclePlate: string,
    date: string,
    time: string,
    services: string[]
) {
    const servicesList = services.map(s => `<li>${s}</li>`).join('')

    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10B981; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px 20px; border-radius: 0 0 8px 8px; }
        .info-box { background: white; padding: 15px; border-left: 4px solid #10B981; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Agendamento Confirmado!</h1>
        </div>
        <div class="content">
            <p>Olá ${customerName},</p>
            <p>Seu agendamento foi confirmado com sucesso!</p>
            <div class="info-box">
                <p><strong>Veículo:</strong> ${vehiclePlate}</p>
                <p><strong>Data:</strong> ${date}</p>
                <p><strong>Horário:</strong> ${time}</p>
                <p><strong>Serviços:</strong></p>
                <ul>${servicesList}</ul>
            </div>
            <p>Aguardamos você na data e horário marcados!</p>
        </div>
        <div class="footer">
            <p>© 2024 Oficina Manager. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>
    `
}
