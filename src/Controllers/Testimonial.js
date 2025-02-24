const express = require('express');
const router = express.Router();
const Testimonial = require('../Model/Testimonial');
const ErrorHandling = require('../../utils/Errorhandling');
const catchAsyncError = require('../../middleware/catchAsyncError');
const uploadFiletoS3 = require('../../utils/uploadFile');
const base64ToBuffer = require('../../utils/Base64ToBuffer');

// createTestimonial API
const createTestimonial = catchAsyncError(async (req, res, next) => {
    
    const { name, review, rating, image } = req.body;

    if (!image) {
        return next(new ErrorHandling(400, 'Image in base64 format is required'));
    }

    const buffer = base64ToBuffer(image);

    const imageUrl = await uploadFiletoS3({...buffer, name: "reviewImage"});

    const newTestimonial = await Testimonial.create({
        name,
        review,
        rating,
        imageUrl
    });

    res.status(201).json({
        success: true,
        message: 'Testimonial created successfully',
        testimonial: newTestimonial
    });
});

// getAllTestimonials API
const getAllTestimonials = catchAsyncError(async (req, res, next) => {
    const testimonials = await Testimonial.find();

    res.status(200).json({
        success: true,
        testimonials
    });
});


// updateTestimonial API
const updateTestimonial = catchAsyncError(async (req, res, next) => {
    const { name, review, rating, image } = req.body;
    let updatedData = { name, review, rating };

    if (image) {
        const buffer = base64ToBuffer(image);
        const imageUrl = await uploadFiletoS3({...buffer, name:"testimonial"});
        updatedData.imageUrl = imageUrl;
    }

    const updatedTestimonial = await Testimonial.findByIdAndUpdate(req.params.id, updatedData, { new: true });

    if (!updatedTestimonial) {
        return next(new ErrorHandling(404, 'Testimonial not found'));
    }

    res.status(200).json({
        success: true,
        message: 'Testimonial updated successfully',
        testimonial: updatedTestimonial
    });
});


// deleteTestimonial API
const deleteTestimonial = catchAsyncError(async (req, res, next) => {
    const deletedTestimonial = await Testimonial.findByIdAndDelete(req.params.id);

    if (!deletedTestimonial) {
        return next(new ErrorHandling(404, 'Testimonial not found'));
    }

    res.status(200).json({
        success: true,
        message: 'Testimonial deleted successfully'
    });
});

module.exports= {createTestimonial, getAllTestimonials, updateTestimonial, deleteTestimonial};