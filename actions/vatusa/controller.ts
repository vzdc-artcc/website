'use server';

import {VATUSA_API, VATUSA_API_KEY} from "@/actions/vatusa/config";

export const addVatusaSolo = async (cid: string, position: string, expires: Date) => {

    const expireSplit = expires.toISOString().split("T");

    const expireDate = expireSplit[0];

        let soloObj: { [key: string]: string | number } = {
        'cid': cid,
        'position': position,
        'expDate': expireDate
    };

    let soloForm = [];
    for (let property in soloObj) {
        let encodedKey = encodeURIComponent(property);
        let encodedValue = encodeURIComponent(soloObj[property]);
        soloForm.push(encodedKey + "=" + encodedValue);
    }

    const res = await fetch(`${VATUSA_API}/solo?apikey=${VATUSA_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: soloForm.join("&"),
    });

    const data = await res.json();
    if (data.data.status === 'error') {
        console.log(data.data.msg)
    }

    return data.cid;
}

export const deleteVatusaSolo = async (cid: string, position: string) => {

    let soloObj: { [key: string]: string | number } = {
        'cid': cid,
        'position': position,
    };

    let soloForm = [];
    for (let property in soloObj) {
        let encodedKey = encodeURIComponent(property);
        let encodedValue = encodeURIComponent(soloObj[property]);
        soloForm.push(encodedKey + "=" + encodedValue);
    }

    const res = await fetch(`${VATUSA_API}/solo?apikey=${VATUSA_API_KEY}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: soloForm.join("&"),
    });

    const data = await res.json();
    if (data.data.status === 'error') {
        console.log(data.data.msg)
    }
    
    return data.cid;
}

export const getController = async (cid: string): Promise<{
    fname: string,
    lname: string,
    email: string,
    rating: number,
} | undefined> => {
    const res = await fetch(`${VATUSA_API}/user/${cid}?apikey=${VATUSA_API_KEY}`);
    const data = await res.json();
    if (data.data.status === 'error') {
        return undefined;
    }

    return data.data;
}