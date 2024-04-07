const crypto = require('crypto');

// Key in hexadecimal format
const keyHex = "7F6818EC52D40FAFA04B535997E87152";

// Convert the key to a buffer
const key = Buffer.from(keyHex, 'hex');

// The data to be encrypted
// const data = "merchant_id=2879789&order_id=1234578&currency=INR&amount=1.00&redirect_url=http://www.shikshaml.com/&cancel_url=http://www.shikshaml.com";
// const data = "merchant_id=2879789&order_id=1234578&currency=INR&amount=1.00&redirect_url=https://midasfintechsolutions.com/&cancel_url=https://midasfintechsolutions.com";
//const data = "merchant_id=2879789&order_id=23434342&currency=INR&amount=1.00&redirect_url=https://www.abc.com/&cancel_url=https://www.abc.com&payment_option=OPTCRDC&card_type=CRDC&card_name=abcCard&data_accept=Y";
const data = 'merchant_id=2879789&order_id=1234578&currency=INR&amount=1.00&redirect_url=https://www.abc.com/&cancel_url=https://www.abc.com'; 
// const data = "merchant_id=2879789&order_id=ABC123XYZ456&currency=INR&amount=1000.00&redirect_url=https://example.com/redirect&cancel_url=https://example.com/cancel&payment_option=OPTCRDC&card_type=CRDC&card_name=SampleCard&data_accept=Y&card_number=1234567890123456&expiry_month=12&expiry_year=25&cvv_number=123&issuing_bank=SampleBank&mobile_no=9876543210";

// AES-128 encryption using CBC mode
const iv = crypto.randomBytes(16); // Initialization Vector
const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);

// Update the cipher with the data
let encryptedData = cipher.update(data, 'utf8', 'base64');
encryptedData += cipher.final('base64');

// Combine the IV and the encrypted data
const encryptedDataWithIV = Buffer.concat([iv, Buffer.from(encryptedData, 'base64')]);

// Encode the result in base64 to store or transmit
const encryptedDataBase64 = encryptedDataWithIV.toString('base64');

console.log("Encrypted data (in base64):");
console.log(encryptedDataBase64);