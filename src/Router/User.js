const Express=require('express');
const {isAuthentication,isAuthorizeRole}=require('../../middleware/authentication');
const app=Express.Router();
const {signUp, sendOtp, verifyOtp, logOut, updateProfile, getProfile, getUser, getUsers} = require('../Controllers/User');

app.post('/signUp', signUp);
app.post('/sendOtp', sendOtp);
app.post('/verifyOtp',verifyOtp);
app.get('/logOut',isAuthentication,logOut);
app.put('/updateProfile',isAuthentication, updateProfile);
app.get('/getProfile',isAuthentication,getProfile);
app.get('/getUser/:id',isAuthentication,isAuthorizeRole("admin"),getUser);
app.get('/getUsers',isAuthentication,isAuthorizeRole("admin"),getUsers);

module.exports=app;