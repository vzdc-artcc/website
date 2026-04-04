import nodemailer from 'nodemailer';
import {SendEmailCommand, SESv2Client} from "@aws-sdk/client-sesv2";

const {
    AWS_SMTP_FROM,
    AWS_SMTP_REGION
} = process.env;

const ses = new SESv2Client({region: AWS_SMTP_REGION,});

export const mailTransport = nodemailer.createTransport({
    SES: {ses, SendEmailCommand},
});

export const FROM_EMAIL = AWS_SMTP_FROM;