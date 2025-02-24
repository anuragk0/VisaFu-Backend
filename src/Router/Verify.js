const Express=require('express');
const {isAuthentication,isAuthorizeRole}=require('../../middleware/authentication');
const app=Express.Router();
const {verifyDocument} = require('../Controllers/Verify');

app.post('/verifyDocument', verifyDocument);

module.exports=app;