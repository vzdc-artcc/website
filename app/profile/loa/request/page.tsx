import React from 'react';
import FlagGate from "@/components/Access/FlagGate";
import LoaRequestView from "@/components/LOA/LoaRequestView";

export default function Page() {

    return (
        <FlagGate flag="no_request_loas" deniedHeading="Leave of Absence Request"
                  deniedMessage="You are not allowed to request LOAs.">
            <LoaRequestView/>
        </FlagGate>
    );
}
