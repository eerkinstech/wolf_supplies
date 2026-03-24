'use client';

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import toast from 'react-hot-toast';
import { useMetaTags } from '../hooks/useMetaTags';
import Layout from '../components/Layout/Layout';
import { getApiUrl } from '../utils/envHelper';

import { Helmet } from 'react-helmet-async';

const DynamicPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const API_URL = getApiUrl();
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);

    // Set meta tags
    useMetaTags({
        title: page?.metaTitle || page?.title || 'Page',
        description: page?.metaDescription || page?.description || '',
        keywords: page?.metaKeywords || '',
        url: typeof window !== 'undefined' ? window.location.href : '',
    });

    useEffect(() => {
        const fetchPage = async () => {
            try {
                setLoading(true);

                // Step 1: Check if this URL has a redirect
                const currentPath = `/${slug}`;
                console.log('📍 Checking redirect for:', currentPath);

                const redirectResponse = await fetch(`${API_URL}/api/resolve-redirect?from_url=${encodeURIComponent(currentPath)}`);
                const redirectData = await redirectResponse.json();

                if (redirectData.found && redirectData.redirect) {
                    console.log('🔄 Redirect found! Redirecting to:', redirectData.redirect.to);
                    navigate(redirectData.redirect.to);
                    return;
                }

                // Step 2: Try to fetch the page
                const response = await fetch(`${API_URL}/api/pages/${slug}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        console.log('❌ Page not found, redirecting to home');
                        navigate('/');
                        return;
                    }
                    throw new Error('Failed to fetch page');
                }

                const data = await response.json();
                setPage(data);
                window.scrollTo(0, 0);
            } catch (error) {
                console.error('Error fetching page:', error);
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        fetchPage();
    }, [slug, API_URL, navigate]);

    if (loading) {
        return (
            <Layout>
                <div className="w-full min-h-screen flex items-center justify-center">
                    <div className="animate-spin">
                        <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-800 rounded-full"></div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!page) {
        return (
            <Layout>
                <div className="w-full min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900">Page Not Found</h1>
                        <p className="text-gray-600 mt-2">The page you're looking for doesn't exist.</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <>
            <Helmet>
                <title>{page.metaTitle || page.title || 'Page'} | Wolf Supplies</title>
                <meta name="description" content={page.metaDescription || page.title} />
                <meta name="keywords" content={page.metaKeywords || ''} />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href={`https://wolfsupplies.co.uk/page/${slug}`} />
                <meta property="og:title" content={page.metaTitle || page.title || 'Wolf Supplies'} />
                <meta property="og:description" content={page.metaDescription || page.title} />
                <meta property="og:image" content="https://wolfsupplies.co.uk/og-image.jpg" />
                <meta property="og:url" content={`https://wolfsupplies.co.uk/page/${slug}`} />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={page.metaTitle || page.title || 'Wolf Supplies'} />
                <meta name="twitter:description" content={page.metaDescription || page.title} />
            </Helmet>
            <Layout>
                <div className="w-full bg-white">
                    {/* Page Header */}
                    <div className="border-b py-8 px-4 md:px-8" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                        <div className="max-w-4xl mx-auto">
                            <h1 className="text-6xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{page.title}</h1>
                        </div>
                    </div>
                    {/* Page Content */}
                    <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
                        <div
                            className="text-lg leading-relaxed"
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            <div
                                className="dynamic-content"
                                dangerouslySetInnerHTML={{ __html: page.content }}
                            />
                        </div>
                    </div>

                    <style>{`
                    .dynamic-content h1, .dynamic-content h2, .dynamic-content h3, 
                    .dynamic-content h4, .dynamic-content h5, .dynamic-content h6 {
                        color: var(--color-text-primary);
                        font-weight: 700;
                        margin: 1.5rem 0 1rem 0;
                        line-height: 1.4;
                    }
                    
                    .dynamic-content h1 { font-size: 2.25rem; }
                    .dynamic-content h2 { font-size: 1.875rem; }
                    .dynamic-content h3 { font-size: 1.5rem; }
                    .dynamic-content h4 { font-size: 1.25rem; }
                    .dynamic-content h5 { font-size: 1.125rem; }
                    .dynamic-content h6 { font-size: 1rem; }
                    
                    .dynamic-content p {
                        
                        line-height: 1.75;
                        color: var(--color-text-secondary);
                    }
                    
                    .dynamic-content ul,
                    .dynamic-content ol {
                        margin: 1rem 0;
                        padding-left: 2rem;
                    }
                    
                    .dynamic-content li {
                        margin-bottom: 0.5rem;
                        line-height: 1.75;
                        color: var(--color-text-secondary);
                    }
                    
                    .dynamic-content a {
                        color: var(--color-desert-600);
                        text-decoration: underline;
                    }
                    
                    .dynamic-content a:hover {
                        color: var(--color-desert-500);
                    }
                    
                    .dynamic-content strong,
                    .dynamic-content b {
                        font-weight: 700;
                        color: var(--color-text-primary);
                    }
                    
                    .dynamic-content em,
                    .dynamic-content i {
                        font-style: italic;
                    }
                    
                    .dynamic-content code {
                        background-color: var(--color-bg-section);
                        padding: 0.25rem 0.5rem;
                        border-radius: 0.25rem;
                        font-family: monospace;
                        font-size: 0.9em;
                        color: var(--color-text-primary);
                    }
                    
                    .dynamic-content pre {
                        background-color: var(--color-bg-section);
                        padding: 1rem;
                        border-radius: 0.5rem;
                        overflow-x: auto;
                        margin: 1rem 0;
                    }
                    
                    .dynamic-content blockquote {
                        border-left: 4px solid var(--color-desert-400);
                        padding-left: 1.5rem;
                        margin: 1.5rem 0;
                        color: var(--color-text-light);
                        font-style: italic;
                    }
                    
                    .dynamic-content hr {
                        border: none;
                        border-top: 2px solid var(--color-border);
                        margin: 2rem 0;
                    }
                    
                    .dynamic-content img {
                        max-width: 100%;
                        height: auto;
                        margin: 1.5rem 0;
                        border-radius: 0.5rem;
                    }
                    
                    .dynamic-content table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 1.5rem 0;
                    }
                    
                    .dynamic-content th,
                    .dynamic-content td {
                        padding: 0.75rem;
                        border: 1px solid var(--color-border-light);
                    }
                    
                    .dynamic-content th {
                        background-color: var(--color-desert-200);
                        font-weight: 700;
                        color: var(--color-text-primary);
                    }
                `}</style>
                </div>
            </Layout>
        </>
    );
};

export default DynamicPage;
