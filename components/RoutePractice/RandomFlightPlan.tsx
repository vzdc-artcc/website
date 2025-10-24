import AirportsAndRoutes from "./AirportsAndRoutes";

const eastOfKRDU = [
  "FAY",
  "ILM",
  "ORF",
  "DIW",
  "ECG",
  "WAVES",
  "DOILY",
  "HOUKY",
  "BBDOL",
  "GEARS",
  "MYFOO",
  "CHS",
  "SAV",
  "TYI",
  "RAUKY",
  "YAZUU",
  "KNUKK",
  "BSERK",
  "Q22",
  "Q75",
  "Q101",
  "Q87",
  "Q117",
  "NEWHP",
  "BEEGE",
  "WHYYT",
  "SHRKS",
  "HIROP",
  "FATTY",
];

const westOfKRDU = [
  "GSO",
  "SPA",
  "ATL",
  "BNA",
  "VUZ",
  "HASSL",
  "GARDD",
  "PEJAY",
  "PROWD",
  "ELEXX",
  "RBUKL",
  "AGGIY",
  "WALCT",
  "CRUEB",
  "JONEZ",
  "STNLI",
  "SKWYR",
  "GQO",
  "MEM",
  "MGM",
  "Q68",
  "Q22",
  "Q108",
  "Q176",
  "Q19",
  "PECKS",
  "VARNE",
  "DARCY",
  "ADELL",
  "STRUK",
];

const generateRandomAltitudes = (isEven:number) => {
    const minAlt = 160
    const maxAlt = 470

    while (true) {
        const randomAlt = Math.floor(Math.random() * ((maxAlt - minAlt) / 10 + 1)) * 10 + minAlt;
    
        let iafdof = 
          [420, 440, 460].includes(randomAlt) || 
          (isEven && !([430, 470].includes(randomAlt) || (randomAlt / 10) % 2 === 0)) || 
          (!isEven && (([430, 470].includes(randomAlt)) || !(randomAlt === 450 || (randomAlt / 10) % 2 !== 0)));
    
        // Bias control: allow TRUE only 30% of the time, otherwise regenerate
        if (!iafdof || Math.random() < 0.2) {
          return { randomAlt, iafdof };
        }
    }
}

const insertRandomError = (route:string,isEven:number) => {
    let errors;
    if (isEven) {
        errors = westOfKRDU;
    }else{
        errors = eastOfKRDU;
    }

    const numberOfErrors = Math.floor(Math.random() * 4 + 1);

    let splitRoute = route.split(' ');
    for(let i = 0;i<numberOfErrors;i++){
        
        const lengthOfSplitRoute = splitRoute.length;

        const randomError = errors[Math.floor(Math.random() * errors.length)];

        const errorLocation = Math.floor(Math.random() * (lengthOfSplitRoute - 2) + 2)

        splitRoute.splice(errorLocation, 0, randomError);
    }


    return splitRoute.join(' ');
}

const removeTransition = (route:string) => {
    let splitRoute = route.split(' ');

    splitRoute.splice(1,1);
    return splitRoute.join(' ');
}

const generateBeaconCode = () => {
    const beaconCode = Math.floor(Math.random() * (7000-2100)+2100);
    return beaconCode
}

const generateCallsign = () => {
    const airlineICAOCodes = [
        "AAL",
        "UAL",
        "DAL",
        "SWA",
        "JBU",
        "ASA",
        "FFT",
        "NKS",
        "RPA",
        "SKW",
        "ENY",
        "PDT",
        "ASH",
        "QXE",
        "EDV",
        "AWI",
        "GJS",
        "JIA",
        "FDX",
        "UPS",
        "ABX",
        "GTI",
        "CKS",
        "NCA",
        "CJT",
        "BAW",
        "AFR",
        "DLH",
        "KLM",
        "SAS",
        "FIN",
        "IBE",
        "VLG",
        "EZY",
        "RYR",
        "UAE",
        "QTR",
        "ETD",
        "THY",
        "ELY",
        "SIA",
        "CPA",
        "CCA",
        "CES",
        "CSN",
        "ANA",
        "JAL",
        "AMX",
        "VOI",
        "ACA"
      ];
    const callsignNumber = Math.floor(Math.random() * (9999)+1)
    const randomAirline = airlineICAOCodes[Math.floor(Math.random() * airlineICAOCodes.length)];

    return randomAirline+callsignNumber;

}

const generateCID = () => {
    return Math.floor(Math.random()*(999-100+1)+100);
}

const generateAircraftType = () => {
    const aircraftTypes = [
        "A318",
        "A319",
        "A320",
        "A20N",
        "A321",
        "A21N",
        "A332",
        "A333",
        "A338",
        "A339",
        "A343",
        "A346",
        "A359",
        "A35K",
        "A388",
        "BCS1",
        "BCS3",
        "B732",
        "B733",
        "B734",
        "B735",
        "B736",
        "B737",
        "B738",
        "B739",
        "B38M",
        "B39M",
        "B744",
        "B748",
        "B752",
        "B753",
        "B763",
        "B764",
        "B772",
        "B77L",
        "B77W",
        "B788",
        "B789",
        "B78X",
        "CRJ2",
        "CRJ7",
        "CRJ9",
        "E135",
        "E145",
        "E170",
        "E175",
        "E190",
        "E195",
        "C25C",
        "C56X",
        "GLF5",
        "GLF6",
        "LJ45",
        "FA7X",
        "GLEX"
      ];
    
    return aircraftTypes[Math.floor(Math.random() * aircraftTypes.length)];
}

const generateEquipmentSuffix = (wrongEq:number, fpAlt:number) => {

    if (wrongEq < 2){
        const temp = ["Z", "X", "T", "U", "C", "I", " "];

        if (fpAlt > 290){
            temp.push("G");
        }

        return temp[Math.floor(Math.random() * temp.length)];
    }else{
        
        if (fpAlt > 290){
            return "L";
        }else{
            const temp = ["L", "G"];
            return temp[Math.floor(Math.random() * temp.length)];
        }

    }

}

const generateRandomSpeed = () => {
    return Math.floor(Math.random() * (370-250+1)+250);
}

const generateRandomFlightPlan = () => {
    const randomAirport = AirportsAndRoutes[Math.floor(Math.random() * AirportsAndRoutes.length)];

    let wrongRoute = Math.floor(Math.random() * 2);
    const missingTransition = Math.floor(Math.random() * 11);
    const wrongEq = Math.floor(Math.random() * 11);

    let fpAlt, fpRte, eqSuffix;

    const randomAltitude = generateRandomAltitudes(randomAirport.isEven);

    fpAlt = randomAltitude.randomAlt;
    const iafdof = randomAltitude.iafdof;

    eqSuffix = generateEquipmentSuffix(wrongEq, fpAlt);
    let wrongEqBool = false;
    if (wrongEq < 2) wrongEqBool = true;

    fpRte = randomAirport.routes[0];
    if (randomAirport.routes.length > 1){
        fpRte = randomAirport.routes[Math.floor(Math.random() * randomAirport.routes.length)];
    }

    if (wrongRoute && ["KBOS","KCLT","KATL","KJFK","KEWR","KLGA","KPHL","KDCA","KIAD","KBWI","KRIC"].includes(randomAirport.destination)){
        fpRte = insertRandomError(fpRte, randomAirport.isEven);
    }else{
        wrongRoute = 0;
    }

    let missingTransitionBool;
    if (missingTransition < 2){
        fpRte = removeTransition(fpRte);
        missingTransitionBool = true;
    }else{
        missingTransitionBool = false;
    }

  
    return {
        dep: "KRDU",
        dest: randomAirport.destination,
        alt: fpAlt,
        iafdof: iafdof,
        rte: fpRte,
        wrongRoute: wrongRoute,
        missingTransition: missingTransitionBool,
        bcn: generateBeaconCode(),
        callsign: generateCallsign(),
        cid: generateCID(),
        typ: generateAircraftType(),
        eq: eqSuffix,
        wrongEq: wrongEqBool,
        spd: generateRandomSpeed(),
    }
}

export default generateRandomFlightPlan;