import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { compressVideo, getVideoMetadata } from '../../src/lib/videoCompression.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
  
  if (allowedImageTypes.includes(file.mimetype) || allowedVideoTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max
  }
});

// Upload endpoint
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    const file = req.file;
    const isVideo = file.mimetype.startsWith('video/');
    
    let finalPath = file.path;
    let url = `/uploads/${file.filename}`;

    // Compress video if needed
    if (isVideo) {
      try {
        const metadata = await getVideoMetadata(file.path);
        const outputPath = file.path.replace(path.extname(file.path), '-compressed.webm');
        
        await compressVideo(file.path, outputPath, {
          codec: 'libvpx-vp9',
          bitrate: '1000k',
          crf: 30,
          audioCodec: 'libopus',
        });

        // Delete original and use compressed
        await fs.unlink(file.path);
        finalPath = outputPath;
        url = `/uploads/${path.basename(outputPath)}`;
      } catch (compressionError) {
        console.error('Error compressing video:', compressionError);
        // Continue with original file if compression fails
      }
    }

    res.json({
      success: true,
      url: url,
      filename: path.basename(finalPath),
      type: file.mimetype,
      size: file.size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Error al subir el archivo' });
  }
});

export default router;
