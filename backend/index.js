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

//Database connection with mongodb
mongoose.connect('mongodb+srv://t1krishnak:9976173141@cluster0.xrk0efx.mongodb.net/E-commerce')

//Api Creation

app.get('/',(req,res)=>{
    res.send('Express App is Running')
})

const storage = multer.diskStorage({
    destination: './upload/images'
})
app.listen(port,(error)=>{
    if(!error){
        console.log('server Running on port'+port)
    }
    else{
        console.log('Error:'+error)
    }
})