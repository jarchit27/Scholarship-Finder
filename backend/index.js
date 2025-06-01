const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const config = require("./config.json");

dotenv.config();
mongoose.connect(config.connectString);

const app = express();
const PORT = 8000;
const jwt = require('jsonwebtoken');
const User = require("./models/user.model");
const Scholarship = require("./models/scholarship.model");
const {authenticateToken} = require("./utilities");

app.use(cors());
app.use(express.json());

app.post("/create-account", async (req, res) => {
    if (!req.body) {
        return res.status(400).json({ error: true, message: "Invalid request body" });
    }

    const { fullname, email, password, gender, address, education } = req.body;

    if (!fullname) {
        return res.status(400).json({ error: true, message: "Full Name is required" });
    }
    if (!email) {
        return res.status(400).json({ error: true, message: "Email is required" });
    }

    if (
    !gender ||
    !['male', 'female', 'other'].includes(gender.trim().toLowerCase())
    ) {
        console.log("Received gender:", JSON.stringify(gender));

    return res.status(400).json({
        error: true,
        message: "Valid Gender is required (Male, Female, Other)",
    });
    }
        if (!password) {
        return res.status(400).json({ error: true, message: "Password is required" });
    }
    const isUser = await User.findOne({ email: email });
    if (isUser) {
        return res.status(400).json({ error: true, message: "User already exists" });
    }

    const user = new User({
        fullname,
        email,
        password,
        gender,
        address: address ? { state: address.state } : undefined,
        education: education ? {
            qualification: education.qualification,
            institution: education.institution,
            yearOfPassing: education.yearOfPassing,
            scoreType: education.scoreType,
            scoreValue: education.scoreValue
        } : undefined
    });

    await user.save();

    const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "36000m"
    });

    return res.json({
        error: false,
        user,
        accessToken,
        message: "Registration Successful",
    });
});


app.post("/login" , async(req, res)=>{
    if (!req.body) {
        return res.status(400).json({ error: true, message: "Invalid request body" });
    }

    const {email,password} = req.body;

    if(!email){
        return res.status(400).json({error:true , message: "Email is required"})
    }
    if(!password)
    {
        return res.status(400).json({error:true , message: "Password is required"})
    }

    const userInfo = await User.findOne({email: email});
    if(!userInfo){
        return res.status(400).json({error:true , message: "User not found"})
    }
    if(userInfo.email == email && userInfo.password == password)
    {
        const user = {user: userInfo}
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{expiresIn:"36000m"});

        return res.json({error:false, message:"Login Successful", email, accessToken});
    }
    else
    {
        return res.status(400).json({error:true, message:"Wrong Credentials"});
    }
});

app.get("/get-user" ,authenticateToken, async(req, res)=>{

    const {user} = req.user;
    const isUser = await User.findOne({_id: user._id});
    if(!isUser){
        return res.status(401)
    }

    return res.status(200).json({user:{ fullname: isUser.fullname, email: isUser.email, "_id" : isUser._id }, message:""});

});

app.get("/get-all-scholarships/",authenticateToken ,async (req, res) => {
    console.log("dum");
  try {
    const scholarships = await Scholarship.find();
    return res.json({
      error: false,
      scholarships,
      message: "All scholarships fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app;