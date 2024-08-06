import React from "react";
import emailjs from '@emailjs/browser';

const sendEmail = () => {
    const serviceId = "service_em6gs5f";
    const templateId = "template_chq9blg";
    const publicKey = "qinOAe56EAbANbc2N";

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
};

export default sendEmail;
