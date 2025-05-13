const Express=require('express');
const {isAuthentication}=require('../../middleware/authentication');
const app=Express.Router();
const {verifyDocument} = require('../Controllers/Verify');

app.post('/verifyDocument', isAuthentication, verifyDocument);

module.exports=app;