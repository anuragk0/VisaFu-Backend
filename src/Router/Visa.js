const Express=require('express');
const {isAuthentication,isAuthorizeRole}=require('../../middleware/authentication');
const app=Express.Router();
const {createVisa, getAllVisas, getVisaById, updateVisa, deleteVisa, getAllVisasCard} = require('../Controllers/Visa');

app.post('/createVisa', isAuthentication,isAuthorizeRole("admin"), createVisa);
app.put('/updateVisa/:id', isAuthentication,isAuthorizeRole("admin"),updateVisa);
app.get('/getVisa/:id',getVisaById);
app.get('/getAllVisas',getAllVisas);
app.get('/getAllVisasCard', getAllVisasCard);
app.delete('/deleteVisa/:id',isAuthentication,isAuthorizeRole("admin"),deleteVisa);

module.exports=app;