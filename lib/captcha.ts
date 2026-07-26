import {toast} from "react-toastify";
import {osmium} from "@/lib/osmium/client";

export const checkCaptcha = async (token?: string) => {
    if (!token) {
        toast('Recaptcha validation failed', {type: 'error'});
        return;
    }
    const {data, error} = await osmium.POST("/api/v1/captcha/verify", {body: {token}});

    if (error || !data) {
        toast('Recaptcha validation failed', {type: 'error'});
        return;
    }

    if (!data.success) {
        toast('Recaptcha validation failed', {type: 'error'});
        return;
    }

    if ((data.score ?? 0) < 0.7) {
        toast('Recaptcha validation failed', {type: 'error'});
        return;
    }
}