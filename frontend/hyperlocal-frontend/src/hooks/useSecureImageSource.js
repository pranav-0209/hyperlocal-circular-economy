import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const isAbsoluteUrl = (value) => /^https?:\/\//i.test(value || '');
const isUploadsPath = (value) => /\/uploads\//i.test(value || '');

const toAbsoluteBackendUrl = (value) => {
    if (!value || typeof value !== 'string') return null;
    if (isAbsoluteUrl(value)) return value;

    const baseUrl = api?.defaults?.baseURL;
    if (!baseUrl) return value;

    let origin = String(baseUrl).replace(/\/+$/, '');
    try {
        origin = new URL(baseUrl).origin;
    } catch {
        // Keep normalized base value if URL parsing fails.
    }

    const normalizedPath = value.startsWith('/') ? value : `/${value}`;
    return `${origin}${normalizedPath}`;
};

export default function useSecureImageSource(source) {
    const normalizedSource = useMemo(() => toAbsoluteBackendUrl(source), [source]);
    const [resolvedSource, setResolvedSource] = useState(normalizedSource);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let active = true;
        let objectUrl = null;

        const resolve = async () => {
            if (!normalizedSource) {
                setResolvedSource(null);
                return;
            }

            if (!isUploadsPath(normalizedSource)) {
                setResolvedSource(normalizedSource);
                return;
            }

            try {
                setIsLoading(true);
                const response = await api.get(normalizedSource, { responseType: 'blob' });
                objectUrl = URL.createObjectURL(response.data);

                if (active) {
                    setResolvedSource(objectUrl);
                }
            } catch {
                if (active) {
                    setResolvedSource(null);
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };

        resolve();

        return () => {
            active = false;
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [normalizedSource]);

    return { resolvedSource, isLoading };
}
