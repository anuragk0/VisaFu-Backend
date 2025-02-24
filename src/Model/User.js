const mongoose = require('mongoose');
const jwt=require('jsonwebtoken');
const { Schema } = mongoose;

const userSchema = new Schema({
    mobile: { type: String, required: true, unique: true },
    name: {type: String},
    email: { type: String },
    photoId: { type: Schema.Types.ObjectId, ref: 'Photo' }, 
    passportId: { type: Schema.Types.ObjectId, ref: 'Passport' },  
    visaAppliedIds: [{ type: Schema.Types.ObjectId, ref: 'Visa' }], 
    otp: { type: String },
    otpCreatedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
    role:{ type:String, default:'user' }
});

// for generating token
userSchema.methods.getJwtToken=function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET_ID,{
        expiresIn:process.env.JWT_EXPIRE,
    })
};

module.exports = mongoose.model('User', userSchema);