const axios = require('axios');

const extractPassportData = async (front, back) => {
    const payload = {
        task_id: process.env.RAPID_OCR_TASK_ID,
        group_id: process.env.RAPID_OCR_GROUP_ID,
        data: {
            document1: front,
            document2: back
        }
    };

    const headers = {
        'x-rapidapi-key': process.env.RAPID_OCR_KEY,
        'x-rapidapi-host': process.env.RAPID_OCR_HOST,
        'Content-Type': 'application/json'
    };

    const response = await axios.post(
        process.env.RAPID_OCR_URL,
        payload,
        { headers }
    );

    return response.data;
};

const verifyPassportDetails = async (fileNo, dob) => {
    const payload = {
        fileNo,
        dob
    };

    const headers = {
        'x-rapidapi-key': process.env.RAPID_VERIFY_KEY,
        'x-rapidapi-host': process.env.RAPID_VERIFY_HOST,
        'Content-Type': 'application/json'
    };

    let response = null;

    try {
        response = await axios.post(
            process.env.RAPID_VERIFY_URL,
            payload,
            { headers }
        );
    } catch (error) {
        console.log(error)
    }

    if (response === null) {
        return {
            status: false,
            message: 'Error in verifying passport details'
        };
    }

    return response.data;
};

const formatDob = (dobFromOCR) => {
    const date = new Date(dobFromOCR);
    return  date.toLocaleDateString('en-GB');
}

module.exports = {extractPassportData, verifyPassportDetails, formatDob};