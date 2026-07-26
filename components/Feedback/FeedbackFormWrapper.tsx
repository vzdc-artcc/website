'use client';
import React from 'react';
import FeedbackForm from "@/components/Feedback/FeedbackForm";
import {GoogleReCaptchaProvider} from "react-google-recaptcha-v3";

const RECAPTCHA_KEY = process.env.NEXT_PUBLIC_GOOGLE_CAPTCHA_SITE_KEY || '';

function FeedbackFormWrapper() {
    return (
        <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_KEY}>
            <FeedbackForm/>
        </GoogleReCaptchaProvider>
    );
}

export default FeedbackFormWrapper;