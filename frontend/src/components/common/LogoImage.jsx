import React, { useState } from 'react';

function LogoImage({ src, alt, height, className }) {
    const [hasError, setHasError] = useState(false);

    const handleError = () => {
        setHasError(true);
    };

    if (hasError) {
        return null;
    }

    return (
        <img
            src={src}
            alt={alt}
            height={height}
            className={className}
            onError={handleError}
        />
    );
}

export default LogoImage;