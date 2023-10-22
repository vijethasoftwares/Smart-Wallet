const bcrypt = require('bcrypt');



// // Generate a random OTP of a specified length
// function generateOTP(length = 6) {
//     const otp = crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
//     return otp;
// }
  
function generateOTP() {
    return "123456"
}
  
function verifyOTP(otp, otpHash) {
    return bcrypt.compareSync(otp, otpHash);
  }
  
module.exports = { generateOTP, verifyOTP };
  