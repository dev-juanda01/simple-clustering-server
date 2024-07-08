const { Router } = require("express");
const { CeleryDomain } = require("./celery");
const { delay } = require("./utils");
const { UploadManagerMulter } = require("./UploadManagerMulter");
const multer = require("multer");

const router = Router();
const celery = new CeleryDomain();

router.get("/", (req, res) => {
    res.send("Performance example");
});

router.get("/celery", async (req, res) => {
    res.send("Performance example celery");

    await celery.send();
});

router.get("/celery2", async (req, res) => {
    res.send("Performance example celery2");

    await celery.send2();
});

router.get("/timer", (req, res) => {
    delay(9000);
    res.send(`Ding dong! - ${process.pid}`);
});

router.post("/test/limit/json", async (req, res) => {
    console.log(req.body);

    res.json({ ok: true });

    await celery.send(req.body);
});

const uploadManager = new UploadManagerMulter();

router.post("/upload", uploadManager.upload().single("file"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        res.json({
            message: "File uploaded successfully",
            filename: req.file.filename,
        });
        
    } catch (err) {
        if (err instanceof multer.MulterError) {
            console.log("A Multer error occurred when uploading");
        } else if (err) {
            console.log("An unknown error occurred when uploading", err);
        }
    }
});

module.exports = router;
