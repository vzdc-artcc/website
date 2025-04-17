'use client';
import React, {useEffect, useState} from 'react';
import {Typography} from '@mui/material';

interface MatrixNameProps {
    firstName: string;
    lastName: string;
}

const MatrixName: React.FC<MatrixNameProps> = ({firstName, lastName}) => {
    const [displayText, setDisplayText] = useState<string>(`${firstName} ${lastName}`);
    const [isMatrix, setIsMatrix] = useState<boolean>(false);

    const matrixChars: string =
        'アァイィウヴエカキクケコサシスセソタチツテトナニヌネノハヒフホミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isMatrix) {
            let count = 0;
            interval = setInterval(() => {
                const length = `${firstName} ${lastName}`.length;
                const newText = Array.from({length}, () =>
                    matrixChars.charAt(Math.floor(Math.random() * matrixChars.length))
                ).join('');
                setDisplayText(newText);

                count++;
                if (count > 10) {
                    clearInterval(interval);
                    setDisplayText(`${firstName} ${lastName}`);
                    setIsMatrix(false);
                }
            }, 75);
        }

        return () => clearInterval(interval);
    }, [isMatrix, firstName, lastName]);

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
            {displayText}
        </Typography>
    );
};

export default MatrixName;
