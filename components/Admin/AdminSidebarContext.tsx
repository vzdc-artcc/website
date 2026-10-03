'use client';

import {createContext, ReactNode, useContext, useEffect, useState} from "react";

type AdminSidebarContextType = {
    name: string;
    children: ReactNode;
};

const MenuCtx = createContext<AdminSidebarContextType | null>(null);
const SetMenuCtx = createContext<(menu: AdminSidebarContextType | null) => void>(() => {
});

export function AdminSidebarProvider({children}: { children: ReactNode }) {
    const [menu, setMenu] = useState<AdminSidebarContextType | null>(null);
    return (
        <SetMenuCtx.Provider value={setMenu}>
            <MenuCtx.Provider value={menu}>{children}</MenuCtx.Provider>
        </SetMenuCtx.Provider>
    )
}

export function RegisterAdminSidebar({name, children}: { name: string, children: ReactNode }) {
    const setMenu = useContext(SetMenuCtx);
    useEffect(() => {
        setMenu({name, children});
        return () => setMenu(null);
    }, [children, setMenu]);
    return null;
}

export const useAdminMetadata = () => useContext(MenuCtx);