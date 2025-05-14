const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pdfSchema = new Schema({
    pdf: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("PdfDetails", pdfSchema);