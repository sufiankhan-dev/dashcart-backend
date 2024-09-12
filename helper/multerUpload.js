const multer = require("multer")
const path = require("path")

const upload = multer({
    limits: {
        fileSize: 5000000 // 5MB file size limit
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png)$/)) {
            return cb(new Error('Please upload a valid image file'));
        }
        cb(undefined, true);
    },
    storage: multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, 'uploads/');
        },
        filename: function(req, file, cb) {
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        }
    })
});

exports.upload = upload;