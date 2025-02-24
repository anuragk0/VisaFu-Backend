const Express=require('express');
const {isAuthentication}=require('../../middleware/authentication');
const app=Express.Router();
const {verifyPhoto} = require('../Controllers/Photo');

app.get('/verifyPhoto',isAuthentication,verifyPhoto);

module.exports=app;