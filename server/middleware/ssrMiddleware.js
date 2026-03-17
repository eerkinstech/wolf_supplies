const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const Page = require('../models/Page');

/**
 * Helper function to escape HTML special characters
 */
const escapeHtml = (str) => {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
};

/**
 * SSR Middleware - Serves server-rendered HTML with meta tags for crawlers
 * This middleware intercepts requests for specific routes and injects:
 * - Meta tags (title, description, OG tags)
 * - JSON-LD structured data
 * - Properly formatted HTML for search engines
 */
const ssrMiddleware = async (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
        return next();
    }

    const botUserAgents = [
        'googlebot',
        'google-inspectiontool',
        'googleother',
        'apis-google',
        'adsbot-google',
        'mediapartners-google',
        'feedfetcher-google',
        'google merchant',
        'bingbot',
        'slurp',
        'duckduckbot',
        'baiduspider',
        'yandexbot',
        'facebookexternalhit',
        'twitterbot',
        'linkedinbot',
        'whatsapp',
        'telegram',
        'pinterest',
        'slotovod',
        'mj12bot',
        'claudebot',
        'anthropic',
        'gptbot',
        'chatgpt-user',
        'ahrefsbot',
        'semrushbot',
        'rogerbot',
        'dotbot',
        'screaming frog',
        'sitebulb',
        'ia_archiver',
        'proximic',
        'seznambot',
        'applebot',
        'petalbot',
    ];

    const userAgent = (req.headers['user-agent'] || '').toLowerCase();
    const isBot = botUserAgents.some(bot => userAgent.includes(bot));

    if (!isBot) {
        return next();
    }

    console.log(`[SSR Bot Detected] UA: ${userAgent} PATH: ${req.path}`);

    try {

        // ─────────────────────────────────────────
        // HOME PAGE
        // ─────────────────────────────────────────
        if (req.path === '/' || req.path === '') {
            return res.send(generateHTMLTemplate({
                title: 'Wolf Supplies | Premium Quality Products, Fast UK Delivery & 31-Day Returns',
                description: 'Shop premium quality products at Wolf Supplies. Free UK delivery in 2-4 business days, secure payments, and 31-day hassle-free returns. Based in Birmingham, UK.',
                imageUrl: 'https://wolfsupplies.co.uk/og-image.jpg',
                url: 'https://wolfsupplies.co.uk/',
                ogTitle: 'Wolf Supplies | Premium Quality Products',
                ogDescription: 'Premium quality products with free UK delivery and 31-day returns.',
                jsonLd: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebSite",
                    "name": "Wolf Supplies",
                    "url": "https://wolfsupplies.co.uk",
                    "description": "UK-based online retailer offering premium quality products with free delivery and 31-day returns.",
                    "potentialAction": {
                        "@type": "SearchAction",
                        "target": "https://wolfsupplies.co.uk/products?search={search_term_string}",
                        "query-input": "required name=search_term_string"
                    },
                    "publisher": {
                        "@type": "Organization",
                        "name": "Wolf Supplies",
                        "url": "https://wolfsupplies.co.uk",
                        "logo": "https://wolfsupplies.co.uk/og-image.jpg",
                        "address": {
                            "@type": "PostalAddress",
                            "streetAddress": "Unit 4 Atlas Estates, Colebrook Road",
                            "addressLocality": "Birmingham",
                            "addressRegion": "West Midlands",
                            "postalCode": "B11 2NT",
                            "addressCountry": "GB"
                        },
                        "contactPoint": {
                            "@type": "ContactPoint",
                            "telephone": "+447398998101",
                            "email": "sales@wolfsupplies.co.uk",
                            "contactType": "customer service",
                            "availableLanguage": "English",
                            "areaServed": "GB",
                            "hoursAvailable": "Mo-Fr 09:00-18:00"
                        }
                    }
                })
            }));
        }

        // ─────────────────────────────────────────
        // ABOUT PAGE
        // ─────────────────────────────────────────
        if (req.path === '/about' || req.path === '/about') {
            return res.send(generateHTMLTemplate({
                title: 'About Wolf Supplies | Our Story & Mission',
                description: 'Learn about Wolf Supplies - UK-based retailer (Company No: 16070029) based in Birmingham. Quality products, trusted service, free delivery and 31-day returns.',
                imageUrl: 'https://wolfsupplies.co.uk/og-image.jpg',
                url: 'https://wolfsupplies.co.uk/about-us',
                ogTitle: 'About Wolf Supplies | Our Story & Mission',
                ogDescription: 'UK-based retailer providing quality products, trusted service, and 31-day returns from Birmingham.',
                jsonLd: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "AboutPage",
                    "name": "About Wolf Supplies",
                    "url": "https://wolfsupplies.co.uk/about-us",
                    "description": "Wolf Supplies is a UK-based online retailer registered with Companies House (Company Number: 16070029) operating from Birmingham.",
                    "publisher": {
                        "@type": "Organization",
                        "name": "Wolf Supplies",
                        "legalName": "Wolf Supplies LTD",
                        "url": "https://wolfsupplies.co.uk",
                        "foundingDate": "2024",
                        "address": {
                            "@type": "PostalAddress",
                            "streetAddress": "Unit 4 Atlas Estates, Colebrook Road",
                            "addressLocality": "Birmingham",
                            "addressRegion": "West Midlands",
                            "postalCode": "B11 2NT",
                            "addressCountry": "GB"
                        }
                    }
                })
            }));
        }

        // ─────────────────────────────────────────
        // CONTACT PAGE
        // ─────────────────────────────────────────
        if (req.path === '/contact') {
            return res.send(generateHTMLTemplate({
                title: 'Contact Us | Wolf Supplies',
                description: 'Contact Wolf Supplies. Email: sales@wolfsupplies.co.uk | Phone: +447398998101 | Monday-Friday 9AM-6PM GMT | Birmingham, UK.',
                imageUrl: 'https://wolfsupplies.co.uk/og-image.jpg',
                url: 'https://wolfsupplies.co.uk/contact',
                ogTitle: 'Contact Wolf Supplies',
                ogDescription: 'Get in touch with our team. Available Monday-Friday, 9AM-6PM GMT.',
                jsonLd: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "ContactPage",
                    "name": "Contact Wolf Supplies",
                    "url": "https://wolfsupplies.co.uk/contact",
                    "description": "Contact Wolf Supplies customer support team.",
                    "mainEntity": {
                        "@type": "Organization",
                        "name": "Wolf Supplies",
                        "telephone": "+447398998101",
                        "email": "sales@wolfsupplies.co.uk",
                        "address": {
                            "@type": "PostalAddress",
                            "streetAddress": "Unit 4 Atlas Estates, Colebrook Road",
                            "addressLocality": "Birmingham",
                            "addressRegion": "West Midlands",
                            "postalCode": "B11 2NT",
                            "addressCountry": "GB"
                        },
                        "openingHoursSpecification": {
                            "@type": "OpeningHoursSpecification",
                            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                            "opens": "09:00",
                            "closes": "18:00"
                        }
                    }
                })
            }));
        }

        // ─────────────────────────────────────────
        // ALL PRODUCTS PAGE
        // ─────────────────────────────────────────
        if (req.path === '/products' || req.path === '/shop') {
            return res.send(generateHTMLTemplate({
                title: 'Shop All Products | Wolf Supplies',
                description: 'Browse all products at Wolf Supplies. Premium quality items with free UK delivery in 2-4 days, competitive prices and 31-day returns. Birmingham, UK.',
                imageUrl: 'https://wolfsupplies.co.uk/og-image.jpg',
                url: 'https://wolfsupplies.co.uk/products',
                ogTitle: 'Shop All Products | Wolf Supplies',
                ogDescription: 'Browse premium quality products with free UK delivery and 31-day returns.',
                jsonLd: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "CollectionPage",
                    "name": "Shop All Products | Wolf Supplies",
                    "description": "Browse all products at Wolf Supplies - premium quality with free UK delivery.",
                    "url": "https://wolfsupplies.co.uk/products",
                    "publisher": {
                        "@type": "Organization",
                        "name": "Wolf Supplies",
                        "url": "https://wolfsupplies.co.uk"
                    }
                })
            }));
        }

        // ─────────────────────────────────────────
        // ALL CATEGORIES PAGE
        // ─────────────────────────────────────────
        if (req.path === '/categories' || req.path === '/category') {
            return res.send(generateHTMLTemplate({
                title: 'All Categories | Wolf Supplies',
                description: 'Browse all product categories at Wolf Supplies. Find exactly what you need with free UK delivery and 31-day returns.',
                imageUrl: 'https://wolfsupplies.co.uk/og-image.jpg',
                url: 'https://wolfsupplies.co.uk/categories',
                ogTitle: 'All Categories | Wolf Supplies',
                ogDescription: 'Browse all product categories at Wolf Supplies.',
                jsonLd: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "CollectionPage",
                    "name": "All Categories | Wolf Supplies",
                    "url": "https://wolfsupplies.co.uk/categories",
                    "publisher": {
                        "@type": "Organization",
                        "name": "Wolf Supplies",
                        "url": "https://wolfsupplies.co.uk"
                    }
                })
            }));
        }

        // ─────────────────────────────────────────
        // CATEGORY DETAIL PAGE
        // ─────────────────────────────────────────
        if (req.path.match(/^\/(category|categories)\/[a-z0-9-]+$/i)) {
            const categorySlug = req.path.split('/').pop();
            const formattedName = categorySlug
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

            try {
                const Category = require('../models/Category');
                const category = await Category.findOne({
                    slug: categorySlug
                }).lean();

                const catTitle = category?.name || formattedName;
                const catDesc = category?.description ||
                    `Shop ${catTitle} products at Wolf Supplies. Free UK delivery and 31-day returns.`;

                return res.send(generateHTMLTemplate({
                    title: `${catTitle} | Wolf Supplies`,
                    description: escapeHtml(catDesc.replace(/<[^>]*>/g, '').substring(0, 155)),
                    imageUrl: category?.image || 'https://wolfsupplies.co.uk/og-image.jpg',
                    url: `https://wolfsupplies.co.uk/category/${categorySlug}`,
                    ogTitle: `${catTitle} | Wolf Supplies`,
                    ogDescription: `Shop ${catTitle} at Wolf Supplies. Free UK delivery and 31-day returns.`,
                    jsonLd: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "CollectionPage",
                        "name": `${catTitle} | Wolf Supplies`,
                        "description": catDesc.replace(/<[^>]*>/g, '').substring(0, 155),
                        "url": `https://wolfsupplies.co.uk/category/${categorySlug}`
                    })
                }));
            } catch (e) {
                return res.send(generateHTMLTemplate({
                    title: `${formattedName} | Wolf Supplies`,
                    description: `Shop ${formattedName} products at Wolf Supplies. Free UK delivery and 31-day returns.`,
                    imageUrl: 'https://wolfsupplies.co.uk/og-image.jpg',
                    url: `https://wolfsupplies.co.uk/category/${categorySlug}`,
                    ogTitle: `${formattedName} | Wolf Supplies`,
                    ogDescription: `Shop ${formattedName} at Wolf Supplies.`
                }));
            }
        }

        // ─────────────────────────────────────────
        // CART PAGE (noindex - private page)
        // ─────────────────────────────────────────
        if (req.path === '/cart') {
            return res.send(generateHTMLTemplate({
                title: 'Your Cart | Wolf Supplies',
                description: 'Review your cart and proceed to checkout at Wolf Supplies.',
                imageUrl: 'https://wolfsupplies.co.uk/og-image.jpg',
                url: 'https://wolfsupplies.co.uk/cart',
                ogTitle: 'Your Cart | Wolf Supplies',
                ogDescription: 'Review your cart and proceed to checkout.',
                noIndex: true
            }));
        }

        // ─────────────────────────────────────────
        // CHECKOUT PAGE (noindex - private page)
        // ─────────────────────────────────────────
        if (req.path === '/checkout') {
            return res.send(generateHTMLTemplate({
                title: 'Checkout | Wolf Supplies',
                description: 'Secure checkout at Wolf Supplies. Multiple payment options including credit card, Apple Pay and Google Pay.',
                imageUrl: 'https://wolfsupplies.co.uk/og-image.jpg',
                url: 'https://wolfsupplies.co.uk/checkout',
                ogTitle: 'Checkout | Wolf Supplies',
                ogDescription: 'Secure checkout with multiple payment options.',
                noIndex: true
            }));
        }

        // ─────────────────────────────────────────
        // WISHLIST PAGE (noindex - private page)
        // ─────────────────────────────────────────
        if (req.path === '/wishlist') {
            return res.send(generateHTMLTemplate({
                title: 'Your Wishlist | Wolf Supplies',
                description: 'View your saved products on Wolf Supplies.',
                imageUrl: 'https://wolfsupplies.co.uk/og-image.jpg',
                url: 'https://wolfsupplies.co.uk/wishlist',
                ogTitle: 'Your Wishlist | Wolf Supplies',
                ogDescription: 'View your saved products.',
                noIndex: true
            }));
        }

        // ─────────────────────────────────────────
        // ORDER DETAIL PAGE (noindex - private page)
        // ─────────────────────────────────────────
        if (req.path.match(/^\/order\/[a-z0-9-]+$/i) || req.path.match(/^\/orders\/[a-z0-9-]+$/i)) {
            return res.send(generateHTMLTemplate({
                title: 'Order Details | Wolf Supplies',
                description: 'View your order details at Wolf Supplies.',
                imageUrl: 'https://wolfsupplies.co.uk/og-image.jpg',
                url: 'https://wolfsupplies.co.uk/orders',
                ogTitle: 'Order Details | Wolf Supplies',
                ogDescription: 'View your order details.',
                noIndex: true
            }));
        }

        // ─────────────────────────────────────────
        // ORDER LOOKUP PAGE (noindex - private page)
        // ─────────────────────────────────────────
        if (req.path === '/order-lookup' || req.path === '/track-order') {
            return res.send(generateHTMLTemplate({
                title: 'Track Your Order | Wolf Supplies',
                description: 'Track the status of your Wolf Supplies order.',
                imageUrl: 'https://wolfsupplies.co.uk/og-image.jpg',
                url: 'https://wolfsupplies.co.uk/order-lookup',
                ogTitle: 'Track Your Order | Wolf Supplies',
                ogDescription: 'Track the status of your order.',
                noIndex: true
            }));
        }

        // ─────────────────────────────────────────
        // PAYMENT OPTIONS PAGE
        // ─────────────────────────────────────────
        if (req.path === '/payment-options') {
            return res.send(generateHTMLTemplate({
                title: 'Secure Payment Methods | Wolf Supplies',
                description: 'Choose your preferred payment method at Wolf Supplies. Secure credit card, Apple Pay, and Google Pay with PCI DSS compliance and SSL encryption.',
                imageUrl: 'https://wolfsupplies.co.uk/og-image.jpg',
                url: 'https://wolfsupplies.co.uk/payment-options',
                ogTitle: 'Secure Payment Methods | Wolf Supplies',
                ogDescription: 'Pay securely with credit card, Apple Pay, or Google Pay. PCI compliant.',
                jsonLd: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebPage",
                    "name": "Secure Payment Methods | Wolf Supplies",
                    "description": "Wolf Supplies offers multiple secure payment options including credit cards, Apple Pay, and Google Pay.",
                    "url": "https://wolfsupplies.co.uk/payment-options"
                })
            }));
        }

        // ─────────────────────────────────────────
        // RETURNS & REFUND POLICY
        // ─────────────────────────────────────────
        if (req.path === '/policies/returns-refund' || req.path === '/policies/returns') {
            return res.send(generateHTMLTemplate({
                title: 'Returns & Refund Policy | Wolf Supplies',
                description: 'Wolf Supplies 31-day return policy. Easy hassle-free returns on all products. Learn how to return items and get a full refund.',
                imageUrl: 'https://wolfsupplies.co.uk/og-image.jpg',
                url: 'https://wolfsupplies.co.uk/policies/returns-refund',
                ogTitle: 'Returns & Refund Policy | Wolf Supplies',
                ogDescription: '31-day hassle-free returns on all orders. Full refund guaranteed.',
                jsonLd: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebPage",
                    "name": "Returns & Refund Policy | Wolf Supplies",
                    "url": "https://wolfsupplies.co.uk/policies/returns-refund",
                    "description": "Wolf Supplies offers a 31-day return policy on all products.",
                    "mainEntity": {
                        "@type": "MerchantReturnPolicy",
                        "name": "Wolf Supplies Return Policy",
                        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
                        "merchantReturnDays": 31,
                        "returnMethod": "https://schema.org/ReturnByMail",
                        "returnFees": "https://schema.org/FreeReturn",
                        "applicableCountry": "GB"
                    }
                })
            }));
        }

        // ─────────────────────────────────────────
        // SHIPPING POLICY
        // ─────────────────────────────────────────
        if (req.path === '/policies/shipping') {
            return res.send(generateHTMLTemplate({
                title: 'Shipping Policy | Wolf Supplies',
                description: 'Free UK delivery in 2-4 business days on all orders. Tracked and insured shipping nationwide. Learn more about our delivery policy.',
                imageUrl: 'https://wolfsupplies.co.uk/og-image.jpg',
                url: 'https://wolfsupplies.co.uk/policies/shipping',
                ogTitle: 'Shipping Policy | Wolf Supplies',
                ogDescription: 'Free UK delivery in 2-4 business days. Tracked shipping on all orders.',
                jsonLd: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebPage",
                    "name": "Shipping Policy | Wolf Supplies",
                    "url": "https://wolfsupplies.co.uk/policies/shipping",
                    "description": "Free UK delivery in 2-4 business days on all Wolf Supplies orders."
                })
            }));
        }

        // ─────────────────────────────────────────
        // PRIVACY POLICY
        // ─────────────────────────────────────────
        if (req.path === '/policies/privacy') {
            return res.send(generateHTMLTemplate({
                title: 'Privacy Policy | Wolf Supplies',
                description: 'Learn how Wolf Supplies collects, uses, and protects your personal data. Fully GDPR compliant and UK data protection law adherent.',
                imageUrl: 'https://wolfsupplies.co.uk/og-image.jpg',
                url: 'https://wolfsupplies.co.uk/policies/privacy',
                ogTitle: 'Privacy Policy | Wolf Supplies',
                ogDescription: 'GDPR compliant privacy policy. Learn how we protect your personal data.'
            }));
        }

        // ─────────────────────────────────────────
        // TERMS & CONDITIONS
        // ─────────────────────────────────────────
        if (req.path === '/policies/terms') {
            return res.send(generateHTMLTemplate({
                title: 'Terms & Conditions | Wolf Supplies',
                description: 'Read the terms and conditions governing the use of Wolf Supplies website and services. UK consumer law compliant.',
                imageUrl: 'https://wolfsupplies.co.uk/og-image.jpg',
                url: 'https://wolfsupplies.co.uk/policies/terms',
                ogTitle: 'Terms & Conditions | Wolf Supplies',
                ogDescription: 'Terms and conditions for shopping at Wolf Supplies. UK law compliant.'
            }));
        }

        // ─────────────────────────────────────────
        // FAQ PAGE
        // ─────────────────────────────────────────
        if (req.path === '/policies/faq' || req.path === '/faq') {
            return res.send(generateHTMLTemplate({
                title: 'Frequently Asked Questions | Wolf Supplies',
                description: 'Find answers to common questions about Wolf Supplies products, delivery, returns, and payment options.',
                imageUrl: 'https://wolfsupplies.co.uk/og-image.jpg',
                url: 'https://wolfsupplies.co.uk/policies/faq',
                ogTitle: 'FAQ | Wolf Supplies',
                ogDescription: 'Answers to common questions about products, shipping, returns and payments.',
                jsonLd: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    "name": "Frequently Asked Questions | Wolf Supplies",
                    "url": "https://wolfsupplies.co.uk/policies/faq",
                    "mainEntity": [
                        {
                            "@type": "Question",
                            "name": "What is your return policy?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "We offer a 31-day return window from the date of purchase. Items must be in resalable condition."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "How long does delivery take?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "We offer free UK delivery in 2-4 business days on all orders."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "Is my payment secure?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Yes. All transactions use SSL encryption and meet PCI DSS standards."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "Do you ship internationally?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Currently we only ship to addresses within the United Kingdom."
                            }
                        }
                    ]
                })
            }));
        }

        // ─────────────────────────────────────────
        // PRODUCT DETAIL PAGE (existing - keep as is)
        // ─────────────────────────────────────────
        if (req.path.match(/^\/product\/[a-z0-9-]+$/i)) {
            const slug = req.path.split('/').pop();
            const product = await Product.findOne({ slug, isDraft: false })
                .populate('categories')
                .lean();
            if (product) {
                return res.send(generateProductPageHTML(product));
            }
        }

        // ─────────────────────────────────────────
        // DYNAMIC PAGES (existing - keep as is)
        // ─────────────────────────────────────────
        if (req.path.match(/^\/page\/[a-z0-9-]+$/i)) {
            const slug = req.path.split('/').pop();
            const page = await Page.findOne({ slug, published: true }).lean();
            if (page) {
                return res.send(generateDynamicPageHTML(page));
            }
        }

        next();

    } catch (error) {
        console.error('[SSR Middleware Error]', error.message);
        next();
    }
};

/**
 * Generate HTML for product page with meta tags and JSON-LD
 */
const generateProductPageHTML = (product) => {
    const title = product.metaTitle || `${product.name} | Wolf Supplies`;
    const description = (product.metaDescription || product.description || '')
        .replace(/<[^>]*>/g, '')
        .substring(0, 160);
    const imageUrl = product.images?.[0]
        ? (product.images[0].startsWith('http') ? product.images[0] : `https://wolfsupplies.co.uk${product.images[0]}`)
        : 'https://wolfsupplies.co.uk/default-product-image.jpg';

    const productUrl = `https://wolfsupplies.co.uk/product/${product.slug}`;
    const price = product.price || 0;
    const sku = product.variantCombinations?.[0]?.sku || product.sku || `WOLF-${product._id}`;

    // Build JSON-LD structured data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: description,
        image: product.images?.filter(img => img) || [imageUrl],
        sku: sku,
        mpn: sku,
        brand: {
            '@type': 'Brand',
            name: 'Wolf Supplies'
        },
        offers: {
            '@type': 'Offer',
            url: productUrl,
            priceCurrency: 'GBP',
            price: price.toString(),
            availability: (product.inStock || product.stock > 0) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            seller: {
                '@type': 'Organization',
                name: 'Wolf Supplies'
            }
        }
    };

    if (product.rating && product.numReviews) {
        jsonLd.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.numReviews
        };
    }

    return generateHTMLTemplate({
        title: escapeHtml(title),
        description: escapeHtml(description),
        imageUrl: escapeHtml(imageUrl),
        url: productUrl,
        ogTitle: escapeHtml(product.name),
        ogDescription: escapeHtml(description),
        ogPrice: price,
        ogPriceCurrency: 'GBP',
        jsonLd: JSON.stringify(jsonLd)
    });
};

/**
 * Generate HTML for dynamic pages
 */
const generateDynamicPageHTML = (page) => {
    const title = page.metaTitle || page.title || 'Page | Wolf Supplies';
    const description = (page.metaDescription || '')
        .substring(0, 160) || 'Read more on Wolf Supplies';

    return generateHTMLTemplate({
        title: escapeHtml(title),
        description: escapeHtml(description),
        imageUrl: page.image || 'https://wolfsupplies.co.uk/default-image.jpg',
        url: `https://wolfsupplies.co.uk/page/${page.slug}`,
        ogTitle: escapeHtml(page.title),
        ogDescription: escapeHtml(description)
    });
};

const generateHTMLTemplate = (metaTags) => {
    const {
        title,
        description,
        imageUrl,
        url,
        ogTitle,
        ogDescription,
        ogPrice,
        ogPriceCurrency,
        jsonLd,
        noIndex = false
    } = metaTags;

    let htmlHead = `
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="theme-color" content="#000000" />
    <meta name="robots" content="${noIndex ? 'noindex, nofollow' : 'index, follow'}" />
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${ogTitle}" />
    <meta property="og:description" content="${ogDescription}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:type" content="${ogPrice ? 'product' : 'website'}" />
    ${ogPrice ? `<meta property="og:price:amount" content="${ogPrice}" />` : ''}
    ${ogPrice ? `<meta property="og:price:currency" content="${ogPriceCurrency}" />` : ''}
    
    <!-- Twitter Card Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${ogTitle}" />
    <meta name="twitter:description" content="${ogDescription}" />
    <meta name="twitter:image" content="${imageUrl}" />
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${url}" />
    `;

    if (jsonLd) {
        htmlHead += `
    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
    ${jsonLd}
    </script>
    `;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
    ${htmlHead}
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <link rel="stylesheet" href="/style.css" />
</head>
<body>
    <div id="root"></div>
    <script>
        // For bots, this signals end of crawlable content
        // Client-side React will hydrate normally
    </script>
</body>
</html>`;
};

module.exports = ssrMiddleware;