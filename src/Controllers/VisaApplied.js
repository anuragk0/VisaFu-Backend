const ErrorHandling = require('../../utils/Errorhandling');
const catchAsyncError = require('../../middleware/catchAsyncError');
const VisaApplied = require('../Model/VisaApplied');

const updateStatus = catchAsyncError( async (req,res,next)=>{
    const { visaAppliedId } = req.params; 
    const { status } = req.body; 

    // Validating the status value
    const validStatuses = ['Ongoing', 'Verification', 'Submit', 'Processing', 'Finished'];
    if (!validStatuses.includes(status)) {
        return next(new ErrorHandling(400, "Invalid status value. Allowed values are: 'Ongoing', 'Verification', 'Submit', 'Processing', 'Finished'" ));
    }

    const visaApplied = await VisaApplied.findByIdAndUpdate(
        visaAppliedId, 
        { status },
        { new: true }
    );

    // If no visa application is found
    if (!visaApplied) {
        return next(new ErrorHandling(404,"Visa application not found" ));
    }

    return res.status(200).json({ message: "Visa application status updated successfully", visaApplied });
})

module.exports = {updateStatus};