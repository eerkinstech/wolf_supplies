import { useEffect } from 'react';

/**
 * Hook to set meta tags for SEO
 * @param {Object} meta - Meta information object
 * @param {string} meta.title - Page title
 * @param {string} meta.description - Meta description
 * @param {string} meta.keywords - Meta keywords
 * @param {string} meta.url - Current page URL
 * @param {string} meta.image - OG image URL (optional)
 * @param {string} meta.type - OG type (default: 'website')
 */
export const useMetaTags = (meta) => {
    useEffect(() => {
        if (!meta) return;

        // Set title
        if (meta.title) {
            document.title = meta.title;
        }

        // Set or update meta description
        let descriptionTag = document.querySelector('meta[name="description"]');
        if (!descriptionTag) {
            descriptionTag = document.createElement('meta');
            descriptionTag.name = 'description';
            document.head.appendChild(descriptionTag);
        }
        if (meta.description) {
            descriptionTag.content = meta.description;
        }

        // Set or update meta keywords
        let keywordsTag = document.querySelector('meta[name="keywords"]');
        if (!keywordsTag) {
            keywordsTag = document.createElement('meta');
            keywordsTag.name = 'keywords';
            document.head.appendChild(keywordsTag);
        }
        if (meta.keywords) {
            keywordsTag.content = meta.keywords;
        }

        // Open Graph tags (for social sharing)
        const ogTags = [
            { property: 'og:title', content: meta.title },
            { property: 'og:description', content: meta.description },
            { property: 'og:url', content: meta.url },
            { property: 'og:type', content: meta.type || 'website' },
            { property: 'og:image', content: meta.image },
        ];
        ogTags.forEach(({ property, content }) => {
            if (content) {
                let tag = document.querySelector(`meta[property="${property}"]`);
                if (!tag) {
                    tag = document.createElement('meta');
                    tag.setAttribute('property', property);
                    document.head.appendChild(tag);
                }
                tag.content = content;
            }
        });

        // Twitter Card tags
        const twitterTags = [
            { name: 'twitter:title', content: meta.title },
            { name: 'twitter:description', content: meta.description },
            { name: 'twitter:image', content: meta.image },
            { name: 'twitter:card', content: 'summary_large_image' },
        ];

        twitterTags.forEach(({ name, content }) => {
            if (content) {
                let tag = document.querySelector(`meta[name="${name}"]`);
                if (!tag) {
                    tag = document.createElement('meta');
                    tag.name = name;
                    document.head.appendChild(tag);
                }
                tag.content = content;
            }
        });

        // Canonical URL
        if (meta.url) {
            let canonicalTag = document.querySelector('link[rel="canonical"]');
            if (!canonicalTag) {
                canonicalTag = document.createElement('link');
                canonicalTag.rel = 'canonical';
                document.head.appendChild(canonicalTag);
            }
            canonicalTag.href = meta.url;
        }
    }, [meta?.title, meta?.description, meta?.keywords, meta?.url, meta?.image, meta?.type]);
};

export default useMetaTags;
