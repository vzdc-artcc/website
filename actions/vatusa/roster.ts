'use server';

import {VATUSA_API, VATUSA_API_KEY, VATUSA_FACILITY} from "@/actions/vatusa/config";
import {User} from "next-auth";

export const removeVatusaController = async (staffUser: User, cid: string, visitor?: boolean) => {

    let purgeObj: { [key: string]: string | number } = {
        'reason': `Inactivity`,
        'by': Number(staffUser.cid),
    };

    let purgeForm = [];
    for (let property in purgeObj) {
        let encodedKey = encodeURIComponent(property);
        let encodedValue = encodeURIComponent(purgeObj[property]);
        purgeForm.push(encodedKey + "=" + encodedValue);
    }

    const res = await fetch(`${VATUSA_API}/facility/${VATUSA_FACILITY}/roster/${visitor ? 'manageVisitor/' : ''}${cid}?apikey=${VATUSA_API_KEY}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: purgeForm.join("&"),
    });

    const data = await res.json();

    return data;
}

export const addVatusaVisitor = async (cid: string) => {
    const res = await fetch(`${VATUSA_API}/facility/${VATUSA_FACILITY}/roster/manageVisitor/${cid}?apikey=${VATUSA_API_KEY}`, {
        method: 'POST',
    });

    if (!res.ok) {
        console.log(await res.json());
    }

    return res.ok;
}
