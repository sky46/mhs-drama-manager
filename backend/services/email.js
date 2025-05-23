const mailjet = require('node-mailjet');

// Set up your Mailjet credentials
const mailClient = new mailjet.apiConnect(
    process.env.MJ_APIKEY_PUBLIC, 
    process.env.MJ_APIKEY_PRIVATE
);

// Function to send an email
async function sendReminderEmails(nonResponders) {
    if (nonResponders.length === 0) {
        console.log("No non-responders to email.");
        return;
    }

    for (const emailObject of nonResponders) {

        const email = emailObject.email;

        try {
            const request = mailClient
                .post('send', { version: 'v3.1' })
                .request({
                    Messages: [
                        {
                            From: {
                                Email: 'merivaledrama373@gmail.com',
                                Name: 'Merivale Drama'
                            },
                            To: [
                                {
                                    Email: email,
                                    Name: 'Student'
                                }
                            ],
                            Subject: 'REMINDER: Drama Production Right Now',
                            TextPart: `
                            Hello, please mark yourself as in attendance to today's drama production or inform the teacher.

                            This is an automatic email. Please do not respond.
                            `,
                        }
                    ]
                });
    
            const result = await request;
            console.log('Email sent:', result.body);
        } catch (error) {
            console.error('Error sending email:', error.response ? error.response.body : error);
        }
    }
}

module.exports = sendReminderEmails;