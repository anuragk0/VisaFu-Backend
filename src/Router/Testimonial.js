const express = require('express');
const {isAuthentication,isAuthorizeRole}=require('../../middleware/authentication');
const { createTestimonial, getAllTestimonials, updateTestimonial, deleteTestimonial } = require('../Controllers/Testimonial');
const app = express.Router();

app.post('/createTestimonial',isAuthentication,isAuthorizeRole("admin"), createTestimonial);

app.get('/getAllTestimonials', getAllTestimonials);

app.put('/updateTestimonial/:id', isAuthentication,isAuthorizeRole("admin"), updateTestimonial);

app.delete('/deleteTestimonial/:id',isAuthentication, isAuthorizeRole("admin"), deleteTestimonial);

module.exports = app;
