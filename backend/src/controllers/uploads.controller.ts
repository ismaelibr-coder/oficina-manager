import { Request, Response } from 'express'

export class UploadsController {
    async upload(req: Request, res: Response) {
        if (!req.file) {
            return res.status(400).json({ message: 'Nenhum arquivo enviado' })
        }

        // Use dynamic baseUrl to work in both development and production
        const baseUrl = process.env.BACKEND_URL || 'https://oficina-manager.onrender.com'
        const fileUrl = `${baseUrl}/uploads/${req.file.filename}`

        return res.json({
            url: fileUrl,
            filename: req.file.filename,
            originalname: req.file.originalname
        })
    }
}
