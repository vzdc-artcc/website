'use server';

const VATUSA_FACILITY = process.env.VATUSA_FACILITY || 'ZDC';

export async function getVatusaRosterMerge(membership: 'home' | 'visit', existingCids: string[]) {
    const res = await fetch(`https://api.vatusa.net/v2/facility/${VATUSA_FACILITY}/roster/${membership}`, {
        next: {
            revalidate: 3600,
        },
    });
    const data: {
        cid: number,
        fname: string,
        lname: string,
        rating: number,
        facility: string,
    }[] = (await res.json()).data;

    return data.filter((controller) => !existingCids.includes(controller.cid.toString()));
}
