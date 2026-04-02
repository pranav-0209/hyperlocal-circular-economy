import { useState } from 'react';
import useSecureImageSource from '../../hooks/useSecureImageSource';

export default function SecureImage({ source, alt, className, fallback = null, onError, ...rest }) {
    const { resolvedSource } = useSecureImageSource(source);
    const [failedSource, setFailedSource] = useState(null);
    const isFailed = Boolean(resolvedSource) && failedSource === resolvedSource;

    if (!resolvedSource || isFailed) {
        return fallback;
    }

    return (
        <img
            src={resolvedSource}
            alt={alt}
            className={className}
            onError={(event) => {
                setFailedSource(resolvedSource);
                if (onError) onError(event);
            }}
            {...rest}
        />
    );
}
