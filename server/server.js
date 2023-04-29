require("dotenv").config(); 
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { Store } = require("express-session");
const mSession = require("connect-mongodb-session")(session);
const app = express();
const uri = process.env.MONGO_URI;
const suri = process.env.SURI;
app.set("view engine",  "ejs");
app.use(express.json());
app.use(express.urlencoded({
    extended:true
}));
app.use(cors());
app.use(cookieParser());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

mongoose.connect( uri || process.env.LURI, {useNewUrlParser: true, useUnifiedTopology: true});

mongoose.connection.on("connected",() =>{
    console.log("mongoose is connected");
})
const FoodRecipe = new mongoose.Schema({
    Email : String,
    Password : String
});
const store = new mSession({
    uri: suri,
    collection: "session", 
},
function(error) {

});
store.on('error',function(error){
    
});

const Register = mongoose.model("Register", FoodRecipe);

const isAuth = (req, res, next) => {
     if(req.session.isAuth){
        next();
     } else {
        res.redirect('/login');
     }
}

app.post("/login",async function(req,res){
    const email = req.body.Email;
    const password = req.body.Password; 
    try{
    const check =  await Register.findOne({Email:email});
    console.log(check);
            if(check.Password == password){
                req.session.isAuth = true;
                res.send({message:"successfull", user : check });
            } else {
                res.send({message:"incorrect password"});
            }
    }
    catch{
        res.send({message : "email incorrect or user not registered"});
    }            
});

app.post("/register", async function(req,res){
    const email = req.body.Email;
    const password = req.body.Password;
    const data = new Register({
        Email : email,
        Password : password
    })
    // await Register.findOne({Email : email}, function(err,user){
    //     if(user){
    //         res.send({message: "user already registered"});
    //     } else{
    //         const register = new Register ({
    //             Email : email,
    //             Password : password
    //     })
    //     register.save(function(err){
    //         if(err){
    //         res.send(err);
    //         } else {
    //         res.send({message:'success'});
    //         }
    //         });
    //     }
    // })
    await Register.insertMany([data]).then(function(){
        res.send({message: 'success'});
    }).catch(function(error){
        console.log(error);
    data.save(function(err){
        if(err){
            res.send(err);
        } else {
            res.send({message:'success'});
        }
    });
    });
})

app.post("/home",isAuth,function(req,res){
    res.render("home");
})
app.listen(4000,function(){
    console.log("server is runing")
})