// Function to convert base64 string to Buffer
const base64ToBuffer = (base64String) => {
    const matches = base64String.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 string');
    }

    // Create a buffer from the base64 data
    const dataBuffer = Buffer.from(matches[2], 'base64');

    // Return an object containing the MIME type and the data buffer
    return {
        mimeType: matches[1],
        data: dataBuffer
    };
};

module.exports = base64ToBuffer;