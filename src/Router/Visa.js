const Express=require('express');
const {isAuthentication,isAuthorizeRole}=require('../../middleware/authentication');
const app=Express.Router();
const {createVisa, getAllVisas, getVisaById, updateVisa, deleteVisa, getAllVisasCard} = require('../Controllers/Visa');

app.post('/createVisa', createVisa);
app.put('/updateVisa/:id', updateVisa);
app.get('/getVisa/:id',getVisaById);
app.get('/getAllVisas',getAllVisas);
app.get('/getAllVisasCard', getAllVisasCard);
app.delete('/deleteVisa/:id',deleteVisa);

module.exports=app;