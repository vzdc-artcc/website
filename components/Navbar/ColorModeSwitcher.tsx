'use client';
import {useColorScheme} from '@mui/material/styles';
import {IconButton, Tooltip} from "@mui/material";
import {DarkMode, LightMode} from "@mui/icons-material";

export default function ColorModeSwitcher() {
    const {mode, systemMode, setMode} = useColorScheme();

    const toggle = () => {
        const resolved = mode === 'system' ? systemMode : mode;
        setMode(resolved === 'dark' ? 'light' : 'dark');
    };

    return (
        <Tooltip title="Toggle light/dark mode">
            <IconButton
                color="inherit"
                onClick={toggle}
            >
                <DarkMode
                    sx={(theme) => ({
                        display: 'block',
                        ...theme.applyStyles('dark', {display: 'none'}),
                    })}
                />
                <LightMode
                    sx={(theme) => ({
                        display: 'none',
                        ...theme.applyStyles('dark', {display: 'block'}),
                    })}
                />
            </IconButton>
        </Tooltip>
    );
};
