const Express=require('express');
const {isAuthentication,isAuthorizeRole}=require('../../middleware/authentication');
const app=Express.Router();
const {verifyPassport} = require('../Controllers/Passport');

app.get('/verifyPassport',isAuthentication,verifyPassport);

module.exports=app;