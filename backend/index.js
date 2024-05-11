const port = 4000;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer =require('multer');
const cors = require('cors');
const path = require('path');

app.use(express.json());
app.use(cors());

// Database connection with MongoDB
mongoose.connect('mongodb+srv://murthy:9976173141@cluster0.q68rwxv.mongodb.net/E-com', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Check MongoDB connection status
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

//Api Creation

app.get('/',(req,res)=>{
    res.send('Express App is Running')
})

const storage = multer.diskStorage({
    destination: './upload/images',
    filename:(req,file,cb)=>{
        return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({storage:storage})

//Creating Upload Endpoint 
app.use('/images',express.static('upload/images'))

app.post("/upload",upload.single('product'),(req,res)=>{
    res.json({
        success:1,
        image_url:`http://localhost:${port}/images/${req.file.filename}`
    })
})

//Schema for Creating Products
const Product = mongoose.model("Product",{
    id:{
        type:Number,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    new_price:{
        type:Number,
        required:true,
    },
    old_price:{
        type:Number,
        required:true,
    },
    date:{
        type:Date,
        default:Date.now,
    },
    available:{
        type:Boolean,
        default:true,
    },

})

app.post('/addproduct',async(req,res)=>{
    let products = await Product.find({});
    let id;
    if(products.length>0)
    {
        let last_product_array =products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id+1;
    }
    else{
        id=1;
    }
    const product = new Product({
        id:id,
        name:req.body.name,
        image:req.body.image,
        category:req.body.category,
        new_price:req.body.new_price,
        old_price:req.body.old_price,
    });
    console.log(product);
    await product.save();
    console.log('Saved');
    res.json({
        success:true,
        name:req.body.name,
    })
})

// Creating Api For deleting Products
app.post('/removeproduct',async(req,res)=>{
    await Product.findOneAndDelete ({id:req.body.id});
    console.log("Removed");
    res.json({
        success:true,
        name:req.body.name
    })
})

// Creating Api For Getting all products
app.get('/allproducts',async(req,res)=>{
    let products = await Product.find({});
    console.log("All Products Fetched");
    res.send(products);
})

// Creating User Schema
const Users = mongoose.model('Users',{
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
    },
    carData:{
        type:Object,
    },
    date:{
        type:Date,
        default:Date.now,
    }
})

// // Creating Endpoint For registering the user
app.post('/signup',async(req,res)=>{

    let check = await Users.findOne({email:req.body.email});
    if(check){
        return res.status(400).json({success:false,errors:"existing user found with same email address"})
    }
    let cart ={};
    for (let i=0; i<300; i++){
        cart[i]=0;
    }
    const user = new Users({
        name:req.body.username,
        email:req.body.email,
        password:req.body.password,
        carData:cart,
    })
    await user.save();
    const data ={
        user:{
            id:user.id
        }
    }
    const token = jwt.sign(data,'secret_ecom');
    res.json({success:true,token})
})


// Creating endpoint for user login
app.post('/login',async(req,res)=>{
    let user = await Users.findOne({email:req.body.email});
    if (user){
        const passCompare = req.body.password === user.password;
        if (passCompare){
            const data ={
                user:{
                    id:user.id
                }
            }
            const token = jwt.sign(data,'secret_ecom');
            res.json({success:true,token});
        }
        else{
            res.json({success:false,errors:"Wrong Password"});
        }
    }
    else{
        res.json({success:false,errors:"Wrong Email Id"})
    }
})


// Creating endpoint New collection data
app.get('/newcollections', async (req, res) => {
        let products = await Product.find({}); 
        let newcollection = products.slice(1).slice(-8);
        console.log("New collection fetched");
        res.send(newcollection);
});


// Creating endpoint for popular in women section
app.get('/popularinwomen',async(req,res)=>{
    let products = await Product.find({category:"women"});
    let popular_in_women = products.slice(0,4);
    console.log("Popular in women fetched");
    res.send(popular_in_women);
})
// creating middleware to fetch user
const fetchUser = async (req,res,next)=>{
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({errors:"Please authenticate using valid"})
    }
    else{
        try{
            const data = jwt.verify(token,'secret_ecom');
            req.user = data.user;
            next();
        } catch(error){
            res.status(401).send({errors:"please authendicte using a valid token "})
        }
    }
}


// creating endpoint for adding products in cartdata

// app.post('/addtocart',fetchUser,async(req,res)=>{
//     console.log("Added",req.body.itemId);
//   let userData = await Users.findOne({_id:req.user.id});
//   userData.cartData[req.body.itemId] += 1;
//   await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData})
//   res.send("Added")
// })

app.post('/addtocart', fetchUser, async (req, res) => {
    console.log("Added", req.body.itemId);
    try {
        let userData = await Users.findOne({ _id: req.user.id });
        if (!userData) {
            return res.status(404).send("User not found");
        }
        if (!userData.cartData) {
            userData.cartData = {};
        }
        if (!userData.cartData[req.body.itemId]) {
            userData.cartData[req.body.itemId] = 0;
        }

        userData.cartData[req.body.itemId] += 1;
        await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
        res.send("Added");
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
});


//Creating endpoint to remove product

// app.post('/removefromcart',fetchUser,async (req,res)=>{
//     console.log("removed",req.body.itemId);
//     let userData = await Users.findOne({_id:req.user.id});
//     if(userData.cartData[req.body.itemId]>0)
//     userData.cartData[req.body.itemId] -= 1;
//     await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData})
//     res.send("Removed")
// })

app.post('/removefromcart', fetchUser, async (req, res) => {
    console.log("Removed", req.body.itemId);
    try {
        let userData = await Users.findOne({ _id: req.user.id });
        if (!userData) {
            return res.status(404).send("User not found");
        }
        if (!userData.cartData) {
            userData.cartData = {};
        }
        if (!userData.cartData[req.body.itemId]) {
            userData.cartData[req.body.itemId] = 0;
        }
        if (userData.cartData[req.body.itemId] > 0) {
            userData.cartData[req.body.itemId] -= 1;
        }

        await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
        res.send("Removed");
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
});


//creating endpoint to get cartdata
// app.post('/getdata',fetchUser,async(req,res)=>{
//     console.log("GetCart");
//     let userData = await Users.findOne({_id:req.user.id});
//     res.json(userData.cartData);
// })

app.post('/getdata', fetchUser, async (req, res) => {
    console.log("GetCart");
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        let userData = await Users.findOne({ _id: req.user.id });

        if (!userData) {
            return res.status(404).json({ error: "User not found" });
        }

        if (!userData.cartData) {
            return res.status(200).json({ cartData: {} }); // Return empty cart data
        }
        
        res.status(200).json({ cartData: userData.cartData });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.listen(port,(error)=>{
    if(!error){
        console.log('server Running on port'+port)
    }
    else{
        console.log('Error:'+error)
    }
})