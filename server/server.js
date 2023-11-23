require("dotenv").config(); 
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const generateToken = require('./auth');
const app = express();
const uri = process.env.MONGO_URI;
const suri = process.env.SURI;
app.set("view engine",  "ejs");
app.use(express.json());
app.use(express.urlencoded({
    extended:true
}));
app.use(cors());


mongoose.connect( uri || process.env.LURI, {useNewUrlParser: true, useUnifiedTopology: true});

mongoose.connection.on("connected",() =>{
    console.log("mongoose is connected");
})
const User = mongoose.model('User',{
    username : String,
    password : String,
});


app.post("/login",async (req,res) => {
  const username = req.body.Email;
  const password = req.body.Password;
    try{
    const user =  await User.findOne({username});
    if (user && (await bcrypt.compare(password, user.password))) {
        const token = generateToken(user);
        return res.status(200).json({ user,token });
      } else {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }
    catch(error){
        res.status(500).json({error : "Login failed"});  
    }            
});

app.post("/register", async (req,res) => {
  const username = req.body.Email;
  const password = req.body.Password;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await User.findOne({ username });
    if(user){
        return res.status(401).json({ error: 'User Already Existed' });
    } else {
        await User.create({ username, password : hashedPassword});
        res.status(201).json({ username, password : hashedPassword });
    }
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
    });
    
// Logout endpoint
app.post('/logout', (req, res) => {
    try{
      return res.status(200).json({ message: 'Logout successful' });
    } catch(error){
      res.status(500).json({ error: 'Logout failed' });
    }
    });
  
app.listen(4000,function(){
    console.log("server is runing")
})