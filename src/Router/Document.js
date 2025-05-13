const Express=require('express');
const {isAuthentication}=require('../../middleware/authentication');
const app=Express.Router();
const {getDocument} = require('../Controllers/Document');

app.post('/getDocument/:num', isAuthentication, getDocument);

module.exports=app;