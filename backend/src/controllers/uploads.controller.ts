import { Request, Response } from 'express'

export class UploadsController {
    async upload(req: Request, res: Response) {
        if (!req.file) {
            return res.status(400).json({ message: 'Nenhum arquivo enviado' })
        }

        const fileUrl = `http://localhost:3001/uploads/${req.file.filename}`

        return res.json({
            url: fileUrl,
            filename: req.file.filename,
            originalname: req.file.originalname
        })
    }
}
