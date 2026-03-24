'use client';

import React, { useEffect, useState } from 'react';
import { getApiUrl } from '../utils/envHelper';

// A plain XML-style sitemap page, no header/footer/layout, Google-style
const SitemapPage = () => {
    const API_URL = getApiUrl();
    const [sitemapContent, setSitemapContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSitemap = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/api/sitemap.xml`);
                if (!response.ok) throw new Error('Failed to fetch sitemap');
                const xmlText = await response.text();
                setSitemapContent(xmlText);
                setError(null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSitemap();
    }, [API_URL]);

    // Google-style: just show the XML, no UI, no header/footer, monospace, white bg
    if (loading) {
        return (
            <div style={{ background: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', color: '#888' }}>
                Loading sitemap...
            </div>
        );
    }
    if (error) {
        return (
            <div style={{ background: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', color: '#c00' }}>
                Error loading sitemap: {error}
            </div>
        );
    }
    return (
        <pre
            style={{
                background: '#000',
                color: '#0f0',
                fontFamily: 'monospace',
                fontSize: '1rem',
                margin: 0,
                padding: 24,
                minHeight: '100vh',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                overflowX: 'auto',
            }}
            data-testid="sitemap-xml"
        >
            {sitemapContent}
        </pre>
    );
};

export default SitemapPage;
