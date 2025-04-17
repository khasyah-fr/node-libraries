require('dotenv').config()
const nodemailer = require('nodemailer')

function generateRandomNumber() {
    return Math.floor(100000 + Math.random() * 900000)
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }  
})

const mailOptions = {
    from: process.env.GMAIL_USER,
    to: process.env.TO_EMAIL,
    subject: 'Random 6-Digit Number',
    text: `Here is your random 6-digit number sir: ${generateRandomNumber()}`
}

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log('Error occured: ', error)
    }
    console.log('Email sent successfully: ', info.response)
})