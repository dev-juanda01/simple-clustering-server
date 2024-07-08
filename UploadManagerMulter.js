const multer = require("multer");

class UploadManagerMulter {
    constructor() {
        this.uploadPath = "uploads/";
        this.storage = multer.diskStorage({
            destination: (req, file, callback) => {
                callback(null, this.uploadPath);
            },
            filename: (req, file, cb) => {
                cb(null, Date.now() + "-" + file.originalname);
            },
        });
    }

    /**
     * Upload files in node server
     * @returns multer manager storage
     */
    upload() {
        return multer({
            storage: this.storage,
            limits: { fileSize: 1 * 1024 * 1024 },
        });
    }

    uploadAny() {
        return multer({ dest: "./uploads" }).any();
    }
}

module.exports = { UploadManagerMulter };
