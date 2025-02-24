const sendToken=(user,res,statusCode)=>{
    const token=user.getJwtToken();
    const options={
        httpOnly:true
    }
    //save in cookie
    res.status(statusCode).cookie("visaFuToken",token,options).json({
        success:true,
        user,
        token, 
        message: "Successfully Login"
    })
}
module.exports=sendToken;