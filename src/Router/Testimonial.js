const express = require('express');
const {isAuthentication,isAuthorizeRole}=require('../../middleware/authentication');
const { createTestimonial, getAllTestimonials, updateTestimonial, deleteTestimonial } = require('../Controllers/Testimonial');
const app = express.Router();

app.post('/createTestimonial', createTestimonial);

app.get('/getAllTestimonials', getAllTestimonials);

app.put('/updateTestimonial/:id', updateTestimonial);

app.delete('/deleteTestimonial/:id',isAuthentication, isAuthorizeRole("admin"), deleteTestimonial);

module.exports = app;
