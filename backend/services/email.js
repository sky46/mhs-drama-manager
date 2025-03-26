const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});


// Function to send emails
async function sendReminderEmails(nonResponders) {
    if (!nonResponders.length) {
        console.log("No non-responders to email.");
        return;
    }

    for (const email of nonResponders) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: "REMINDER: Drama Production Right Now",
                text: 
                    `
                    Hello, please mark yourself as in attendance to today's drama production or inform the teacher.
                    
                    This is an automatic email. Please do not respond.
                     `,
            };

            await transporter.sendMail(mailOptions);
            console.log(`Email sent to ${email}`);
        } catch (error) {
            console.error(`Failed to send email to ${email}:`, error);
        }
    }
}

module.exports = sendReminderEmails;