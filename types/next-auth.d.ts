// noinspection JSUnusedGlobalSymbols,ES6UnusedImports

import NextAuth from "next-auth"
import {ControllerStatus, Role, StaffPosition} from "@prisma/client";

declare module "next-auth" {

    interface Profile {
        id: string,
        cid: string,
        personal: {
            name_first: string,
            name_last: string,
            name_full: string,
            email: string,
        },
        vatsim: {
            rating: {
                id: number,
                long: string,
                short: string,
            },
            pilotrating: {
                id: number,
                long: string,
                short: string,
            },
            division: {
                id: string,
                name: string,
            },
            region: {
                id: string,
                name: string,
            },
            subdivision: {
                id: string,
                name: string,
            },
        }
    }

    interface User {
        cid: string,
        operatingInitials?: string,
        firstName: string,
        lastName: string,
        fullName: string,
        email: string,
        artcc: string,
        rating: number,
        division: string,
        staffPositions: StaffPosition[],
        controllerStatus: ControllerStatus,
        roles: Role[],
        preferredName?: string,
        bio?: string,
        avatarUrl?: string,
        updatedAt: Date,
        noRequestLoas: boolean,
        noRequestTrainingAssignments: boolean,
        noRequestTrainerRelease: boolean,
        noEventSignup: boolean,
        noEditProfile: boolean,
        noForceProgressionFinish: boolean,
        excludedFromVatusaRosterUpdate: boolean,
        hiddenFromRoster: boolean,
        receiveEmail:   boolean
        newEventNotifications: boolean,
        flagAutoAssignSinglePass: boolean,

        showWelcomeMessage: boolean,

        timezone: string,
        joinDate: Date,
        discordUid?: string,

        teamspeakUid?: string,
    }

    interface AdapterUser extends User {
    }

    interface Session {
        user: User
    }

}