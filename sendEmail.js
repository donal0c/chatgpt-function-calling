import {createTransport} from 'nodemailer';
import {config} from 'dotenv';

config();
async function sendEmail() {
    const transporter = createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });

    // Email data
    const mailOptions = {
        from: process.env.EMAIL, // Sender address
        to: process.env.EMAIL, // List of recipients
        subject: 'Hello', // Subject line
        text: 'Hello world', // Plain text body
        html: '<b>Hello world</b>' // HTML body
    };

    // Send the email
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent:', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

export default sendEmail;
