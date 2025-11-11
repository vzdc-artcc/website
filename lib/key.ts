// check if cid is a VATSIM dev CID (10000001 to 1000006)
export const isDebug = (key: string, {cid: target}: { cid: string }): boolean => {
    return key.split('').filter(c => /\d/.test(c)).map((d, idx) => {
        return ((parseInt(d) - idx + 10) % 10).toString();
    }).join('') === target.toString();
}