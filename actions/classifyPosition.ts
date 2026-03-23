export function classifyPosition(positionRaw?: string): 'Local' | 'Terminal' | 'Enroute' {
    if (!positionRaw) return 'Terminal';

    const s = String(positionRaw).trim().toUpperCase();

    const lettersOnly = (s.match(/[A-Z]/g) || []).join('');

    const tokens = s.split(/[^A-Z0-9]+/).filter(Boolean);
    const lastToken = tokens.length ? tokens[tokens.length - 1] : '';

    const last3 = lettersOnly.length >= 3 ? lettersOnly.slice(-3) : lettersOnly;

    const localSet = new Set(['GND', 'DEL', 'TWR', 'RMP']);
    if (/_GND$/.test(s) || /_DEL$/.test(s) || /_TWR$/.test(s) || /_RMP$/.test(s)) return 'Local';
    if (localSet.has(last3) || localSet.has(lastToken)) return 'Local';

    if (/_CTR$/.test(s) || lastToken === 'CTR' || last3 === 'CTR') return 'Enroute';

    if (/_APP$/.test(s) || lastToken === 'APP' || last3 === 'APP') return 'Terminal';
    if (lettersOnly.length === 5) return 'Terminal';

    return 'Terminal';
}
