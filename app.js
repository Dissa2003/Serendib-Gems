
//pgdevuhNSzAhmcDd

const express = require('express');
const mongoose = require('mongoose');
const router = require('./Routes/UserRoutes');
const fs = require('fs');
const path = require('path');

const app = express();
const cors = require('cors');

// Middleware
app.use(express.json());
app.use(cors());
app.use("/users", router);
app.use("/files", express.static("file"));
app.use("/images", express.static("images"));

mongoose.connect("mongodb+srv://admin:pgdevuhNSzAhmcDd@cluster0.ugsnh.mongodb.net/")   
.then(() => console.log("Connected to MongoDB"))
.then(() => {
    app.listen(8000);
})
.catch(err => console.log(err));

// PDF Handling
const multer = require("multer");
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "./file");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        cb(null, uniqueSuffix + file.originalname);
    },
});

require("./Model/PdfModel");
const pdfSchema = mongoose.model("PdfDetails");
const upload = multer({ storage });

// Upload PDF
app.post("/uploadfile", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const title = req.body.title;
    const pdf = req.file.filename;

    try {
        await pdfSchema.create({ title: title, pdf: pdf });
        console.log("PDF uploaded successfully:", pdf);
        res.json({ status: 200 });
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: "error", message: err.message });
    }
});

// Get all PDFs
app.get("/getFile", async (req, res) => {
    try {
        const data = await pdfSchema.find({});
        res.send({ status: 200, data: data });
    } catch (err) {
        console.log(err);
        res.status(500).send({ status: "error" });
    }
});

// Delete PDF
app.delete("/deleteFile/:id", async (req, res) => {
    try {
        const pdfId = req.params.id;
        
        // Find the PDF document
        const pdfToDelete = await pdfSchema.findById(pdfId);
        if (!pdfToDelete) {
            return res.status(404).json({ status: "error", message: "PDF not found" });
        }

        // Delete the file from the filesystem
        const filePath = path.join(__dirname, 'file', pdfToDelete.pdf);
        fs.unlink(filePath, (err) => {
            if (err) console.log("Error deleting file:", err);
        });

        // Delete the record from the database
        await pdfSchema.findByIdAndDelete(pdfId);
        
        res.json({ status: 200, message: "PDF deleted successfully" });
    } catch (err) {
        console.error("Error deleting PDF:", err);
        res.status(500).json({ status: "error", message: err.message });
    }
});