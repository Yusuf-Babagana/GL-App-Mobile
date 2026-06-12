import { useState, useEffect } from 'react';
import i18n from './i18n';

export function useT() {
    const [, force] = useState(0);
    useEffect(() => {
        const h = (lng: string) => {
            console.log('[useT] languageChanged:', lng, 'i18n.language:', i18n.language);
            force(n => n + 1);
        };
        i18n.on('languageChanged', h);
        return () => i18n.off('languageChanged', h);
    }, []);
    return { t: i18n.t.bind(i18n), i18n };
}
