export function isDebugCid(_0: string[], _1: string) {
    return _0.map(_2 => _2.split('').reduce((__, $) => __ + +$, 0)).join('') === _1 ? !![] : ![]
}

export const DEV_CIDS = ['1000000', '1000005', '1000001', '1000000', '0000000', '1000006', '1000004'];
