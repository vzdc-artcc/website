'use client';
import React, {useEffect, useState} from 'react';
import {Typography} from '@mui/material';

const matrixChars: string =
    'アァイィウヴエカキクケコサシスセソタチツテトナニヌネノハヒフホミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

interface MatrixNameProps {
    firstName: string;
    lastName: string;
}

const MatrixName: React.FC<MatrixNameProps> = ({firstName, lastName}) => {
    const fullName = `${firstName} ${lastName}`;
    // Only the scrambled frames live in state; at rest the name is read from props,
    // so a name that arrives after the first render (a query resolving) still shows.
    const [scrambled, setScrambled] = useState<string | null>(null);
    const [isMatrix, setIsMatrix] = useState<boolean>(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isMatrix) {
            let count = 0;
            interval = setInterval(() => {
                const newText = Array.from({length: fullName.length}, () =>
                    matrixChars.charAt(Math.floor(Math.random() * matrixChars.length))
                ).join('');
                setScrambled(newText);

                count++;
                if (count > 10) {
                    clearInterval(interval);
                    setScrambled(null);
                    setIsMatrix(false);
                }
            }, 75);
        }

        return () => clearInterval(interval);
    }, [isMatrix, fullName]);

    return (
        <Typography
            variant="h4"
            onMouseEnter={() => setIsMatrix(true)}
            sx={{
                transition: 'all 0.2s ease',
                color: isMatrix ? '#00ff41' : 'inherit',
                textShadow: isMatrix ? '0 0 8px #00ff41' : 'none',
                fontFamily: isMatrix ? '"Courier New", monospace' : 'inherit',
                cursor: 'pointer',
            }}
        >
            {isMatrix && scrambled !== null ? scrambled : fullName}
        </Typography>
    );
};

export default MatrixName;
