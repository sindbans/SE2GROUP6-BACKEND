// /routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const { upload } = require('../config/multer');

// Single-file upload example
router.post('/image', upload.single('image'), async (req, res) => {
    try {
        // req.file.path is the Cloudinary URL automatically stored by multer-storage-cloudinary
        const imageUrl = req.file.path;

        // If you want the public_id to store separately, you can do:
        // const { public_id, url } = req.file; // or req.file.filename

        // Return or store imageUrl in DB
        return res.status(200).json({ imageUrl });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Image upload failed', error: err.message });
    }
});

module.exports = router;
