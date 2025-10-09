const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: 'dt4qlrthz',
    api_key: '188763215694343',
    api_secret: 'Y_mOZxgmiOlClqlzZf3XY2FL-SM' // استبدل هذا بالسر الحقيقي
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'auction_images',
        allowed_formats: ['jpeg', 'png', 'jpg'],
    },
});

module.exports = {
    cloudinary,
    storage,
};
