import {toast} from "react-toastify";
import {osmium} from "@/lib/osmium/client";

/**
 * Verifies a Cloudflare Turnstile token server-side via osmium's captcha proxy.
 * Returns true only when verification succeeds; toasts and returns false
 * otherwise so callers can abort the submit.
 */
export const checkCaptcha = async (token?: string): Promise<boolean> => {
    if (!token) {
        toast('Please complete the captcha.', {type: 'error'});
        return false;
    }

    const {data, error} = await osmium.POST("/api/v1/captcha/verify", {body: {token}});

    if (error || !data?.success) {
        toast('Captcha verification failed. Please try again.', {type: 'error'});
        return false;
    }

    return true;
}
