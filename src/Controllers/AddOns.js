const ErrorHandling = require('../../utils/Errorhandling');
const catchAsyncError = require('../../middleware/catchAsyncError');
const AddOn = require('../Model/AddOns');

// Create a new AddOn
const createAddOn = catchAsyncError(async (req, res, next) => {
        const { name, description, price, tax, visaFuCharges } = req.body;

        // Create a new add-on
        const addOn = new AddOn({
            name,
            description,
            price,
            visaFuCharges,
            tax
        });

        // Save the add-on to the database
        await addOn.save();

        res.status(201).json({
            success: true,
            message: 'AddOn created successfully',
            data: addOn
        });
});

// Get all AddOns
const getAllAddOns = catchAsyncError(async (req, res, next) => {
        const addOns = await AddOn.find();

        res.status(200).json({
            success: true,
            data: addOns
        }); 
});


// Get AddOn by ID
const getAddOnById = catchAsyncError(async (req, res, next) => {
        
        const { id } = req.params;
        const addOn = await AddOn.findById(id);

        if (!addOn) {
            return ErrorHandling( 404, 'AddOn not found');
        }

        res.status(200).json({
            success: true,
            data: addOn
        }); 
});

// Update an AddOn by ID
const updateAddOn = catchAsyncError(async (req, res, next) => {
        const { id } = req.params;
        const { name, price, description, visaFuCharges, tax } = req.body;

        const updatedAddOn = await AddOn.findByIdAndUpdate(
            id,
            { name, price, description, visaFuCharges, tax},
            { new: true, runValidators: true }
        );

        if (!updatedAddOn) {
            return ErrorHandling( 404, 'AddOn not found');
        }

        res.status(200).json({
            success: true,
            message: 'AddOn updated successfully',
            data: updatedAddOn
        });
});

// Delete an AddOn by ID
const deleteAddOn = catchAsyncError(async (req, res, next) => {
        
        const { id } = req.params;

        const deletedAddOn = await AddOn.findByIdAndDelete(id);

        if (!deletedAddOn) {
            return ErrorHandling( 404, 'AddOn not found');
        }

        res.status(200).json({
            success: true,
            message: 'AddOn deleted successfully'
        });
});

module.exports = {createAddOn, getAllAddOns, getAddOnById, updateAddOn, deleteAddOn}