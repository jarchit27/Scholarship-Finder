const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const scholarshipSchema = new Schema({
    name: { type: String, required: true },
    award: { type: String },
    deadline: { type: String }, 
    eligibility: { type: String }, 
    link: { type: String }, 
}, { timestamps: true });

module.exports = mongoose.model("Scholarship", scholarshipSchema, "scholarship_info");