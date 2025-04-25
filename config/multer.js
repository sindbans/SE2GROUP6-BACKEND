// /config/multer.js
const { cloudinary } = require('./cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'hermespass',
        allowed_formats: ['jpg', 'png', 'jpeg'] // restrict file formats
    }
});

const upload = multer({ storage });

module.exports = { upload };
