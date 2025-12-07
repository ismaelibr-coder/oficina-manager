import { Request, Response } from 'express'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

export class UploadsController {
    async upload(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'Nenhum arquivo enviado' })
            }

            // Upload to Cloudinary instead of local storage
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'oficina-checklists',
                resource_type: 'auto',
                transformation: [
                    { width: 1024, height: 1024, crop: 'limit' },
                    { quality: 'auto:good' }
                ]
            })

            return res.json({
                url: result.secure_url,
                filename: result.public_id,
                originalname: req.file.originalname
            })
        } catch (error: any) {
            console.error('Cloudinary upload error:', error)
            return res.status(500).json({
                message: 'Erro ao fazer upload da foto',
                error: error.message
            })
        }
    }
}
