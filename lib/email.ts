import nodemailer from 'nodemailer';
import {SendRawEmailCommand, SESClient} from "@aws-sdk/client-ses";

const {
    AWS_SMTP_FROM,
    AWS_SMTP_REGION
} = process.env;

const ses = new SESClient({ region: AWS_SMTP_REGION, });

export const mailTransport = nodemailer.createTransport({
    SES: { ses, aws: { SendRawEmailCommand } },
});

export const FROM_EMAIL = AWS_SMTP_FROM;