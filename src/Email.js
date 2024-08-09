import emailjs from '@emailjs/browser';

let lastEmailSent = 0;

const sendEmail = () => {
    const now = Date.now();

    // Check if 5 minutes have passed since the last email was sent
    if (now - lastEmailSent >= 5 * 60 * 1000) {
        const serviceId = "service_57dbz0q";
        const templateId = "template_pv22y0t";
        const publicKey = "0ywMbTytym6ybFx7O";

        const templateParams = {
            to_name: "Hasan",
            message: "Mona Lisa is on move.",
        };

        emailjs.send(serviceId, templateId, templateParams, publicKey)
            .then(
                (result) => {
                    console.log('Success:', result.text);
                },
                (error) => {
                    console.log('Error:', error.text);
                }
            )
            .catch((error) => {
                console.error('Failed to send email:', error);
            });

        lastEmailSent = now; // Update the last email sent time
    } else {
        console.log('Email not sent. Waiting for 5 minutes.');
    }
};

export default sendEmail;
