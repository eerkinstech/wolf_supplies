import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '';

export const usePageSections = (pageName = 'home') => {
    // Initialize from localStorage (if available) otherwise empty.
    // No dummy/default section data.
    const [sections, setSectionsState] = useState(() => {
        if (typeof window === 'undefined') return [];
        try {
            const stored = window.localStorage.getItem(`page-${pageName}`);
            if (stored) return JSON.parse(stored);
        } catch (e) {
            // ignore
        }
        return [];
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fetchAttempted = useRef(false);

    // Only try to load from API once on mount
    useEffect(() => {
        if (fetchAttempted.current) return;
        fetchAttempted.current = true;

        const loadFromAPI = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`${API}/api/page-config/${pageName}`);
                const data = response.data;
                if (data.sections && Array.isArray(data.sections) && data.sections.length > 0) {
                    setSectionsState(data.sections);
                    try {
                        if (typeof window !== 'undefined') {
                            window.localStorage.setItem(`page-${pageName}`, JSON.stringify(data.sections));
                        }
                    } catch (e) {
                        // ignore
                    }
                    return;
                }
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        loadFromAPI();
    }, [pageName]);

    const setSections = useCallback((newSections) => {
        setSectionsState(newSections);
        try {
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(`page-${pageName}`, JSON.stringify(newSections));
            }
        } catch (e) {
        }
    }, [pageName]);

    const saveSections = useCallback(async (customSections = null) => {
        const toSave = customSections || sections;

        // Always save to localStorage first
        try {
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(`page-${pageName}`, JSON.stringify(toSave));
            }
        } catch (e) {
        }

        // Try to save to API (but don't fail if it doesn't work)
        try {
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
            const response = await axios.post(`${API}/api/page-config/${pageName}`, {
                pageName,
                sections: toSave
            }, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
        } catch (err) {
        }

        return toSave;
    }, [sections, pageName]);

    return {
        sections,
        setSections,
        saveSections,
        loading,
        error
    };
};


