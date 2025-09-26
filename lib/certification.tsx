import {ReactNode} from "react";
import {CertificationOption, SoloCertification} from "@prisma/client";
import {Check, Circle, Clear, Timer} from "@mui/icons-material";
import {Tooltip} from "@mui/material";
import {getDaysLeft} from "@/lib/date";

export const getIconForCertificationOption = (certificationOption: CertificationOption, soloCertification?: SoloCertification): ReactNode => {
    switch (certificationOption) {
        case "NONE":
            return <Tooltip title="Not Certified"><Clear fontSize="large" color="error"/></Tooltip>;
        case "UNRESTRICTED":
            return <Tooltip title="Unrestricted Certification"><Check fontSize="large" color="success"/></Tooltip>;
        case "DEL":
            return <Tooltip title="Delivery Certified"><Circle fontSize="large" color="error"/></Tooltip>;
        case "GND":
            return <Tooltip title="Ground Certified"><Circle fontSize="large" color="secondary"/></Tooltip>;
        case "TIER_1":
            return <Tooltip title="Tier 1 Certified"><Check fontSize="large" color="success"/></Tooltip>;
        case "CERTIFIED":
            return <Tooltip title="Certified"><Check fontSize="large" color="success"/></Tooltip>;
        case "TWR":
            return <Tooltip title="Tower Certified"><Check fontSize="large" color="success"/></Tooltip>;
        case "APP":
            return <Tooltip title="Approach Certified"><Check fontSize="large" color="success"/></Tooltip>;
        case "CTR":
            return <Tooltip title="Center Certified"><Check fontSize="large" color="success"/></Tooltip>;
        case "SOLO":
            return <Tooltip
                title={soloCertification ? `${soloCertification?.position} - ${getDaysLeft(soloCertification?.expires || new Date())}` : 'Solo Endorsed'}><Timer
                fontSize="large" color="info"/></Tooltip>;
        default:
            return <Clear fontSize="large" color="error"/>;
    }
}