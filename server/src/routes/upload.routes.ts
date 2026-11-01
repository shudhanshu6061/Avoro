import { Router, Request, Response } from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/', upload.single('image'), requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('[Upload] File received:', req.file?.originalname, req.file?.size, 'bytes');
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    console.log('[Upload] Uploading to Cloudinary...');
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'avoro/products',
      resource_type: 'image',
    });

    console.log('[Upload] Success:', result.secure_url);
    res.json({ url: result.secure_url, public_id: result.public_id });
  } catch (error: any) {
    console.error('[Upload] Failed:', error.message);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

export default router;
