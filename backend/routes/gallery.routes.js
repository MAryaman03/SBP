const express = require('express');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const Gallery = require('../models/Gallery.model');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Get all gallery items
router.get('/', async (req, res, next) => {
  try {
    const items = await Gallery.find().sort('-createdAt');
    res.json({ success: true, count: items.length, items });
  } catch (error) {
    next(error);
  }
});

// Create gallery item (Admin only)
router.post('/', protect, adminOnly, upload.single('image'), async (req, res, next) => {
  try {
    const { title, category } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'snigdha_beauty_parlour/gallery', resource_type: 'image' },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      stream.end(req.file.buffer);
    });

    const item = await Gallery.create({
      title,
      category,
      imageUrl: result.secure_url,
    });

    res.status(201).json({ success: true, item });
  } catch (error) {
    next(error);
  }
});

// Delete gallery item (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Gallery item not found' });
    
    await item.deleteOne();
    res.json({ success: true, message: 'Item removed' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
