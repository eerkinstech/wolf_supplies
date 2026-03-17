import { useEffect, useState } from 'react';

/**
 * Normalize title spacing - ensures pipe character has exactly one space before and after
 */
const normalizeTitle = (title) => {
    return title ? title.replace(/\s*\|\s*/g, ' | ').trim() : '';
};

/**
 * Custom hook to fetch page metadata from the database
 * Returns metadata object that can be passed to useMetaTags
 * Falls back to provided defaults if page not found or no metadata set
 * 
 * @param {string} slug - The page slug (e.g., 'about', 'contact', 'shipping', etc.)
 * @param {object} defaults - Default meta tags if page not found
 *   @param {string} defaults.title
 *   @param {string} defaults.description
 *   @param {string} defaults.keywords
 * @returns {object} Metadata object with title, description, keywords
 */
const usePageMetadata = (slug, defaults = {}) => {
    const API = import.meta.env.VITE_API_URL || '';
    const [metadata, setMetadata] = useState({
        title: normalizeTitle(defaults.title) || '',
        description: defaults.description || '',
        keywords: defaults.keywords || '',
    });

    // Determine if this is a policy page
    const isPolicyPage = slug?.includes('policy-') || slug?.includes('faq') || slug?.includes('privacy') || slug?.includes('shipping') || slug?.includes('returns') || slug?.includes('terms');

    const endpoint = isPolicyPage ? 'policies' : 'pages';

    // Fetch metadata from database
    useEffect(() => {
        if (!slug) return;

        const fetchPageMetadata = async () => {
            try {
                // Use the correct endpoint format: /api/pages/slug or /api/policies/slug
                const response = await fetch(`${API}/api/${endpoint}/${slug}`);
                if (response.ok) {
                    const pageData = await response.json();

                    if (pageData) {
                        // Store database metadata and normalize title spacing
                        const title = pageData.metaTitle || defaults.title || pageData.title;

                        setMetadata({
                            title: normalizeTitle(title),
                            description: pageData.metaDescription || defaults.description || pageData.description,
                            keywords: pageData.metaKeywords || defaults.keywords || '',
                        });
                        return;
                    }
                }
            } catch (error) {
                console.error(`Error fetching metadata for slug: ${slug}`, error);
            }

            // Use defaults if page not found
            setMetadata({
                title: normalizeTitle(defaults.title) || '',
                description: defaults.description || '',
                keywords: defaults.keywords || '',
            });
        };

        fetchPageMetadata();
    }, [slug]);

    return metadata;
};

export default usePageMetadata;
