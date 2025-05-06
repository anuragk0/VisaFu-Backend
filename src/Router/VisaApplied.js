const Express=require('express');
const {isAuthentication,isAuthorizeRole}=require('../../middleware/authentication');
const app=Express.Router();
const {updateStatus} = require('../Controllers/VisaApplied');

app.get('/updateVisaAppliedStatus/:id',isAuthentication,isAuthorizeRole("admin"),updateStatus);

module.exports=app;