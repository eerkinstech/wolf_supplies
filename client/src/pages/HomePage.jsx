import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/Layout/Layout';
import FeaturesSection from '../components/Features/FeaturesSection';
import { cachedJsonFetch } from '../utils/apiCache';
import { getApiUrl } from '../utils/envHelper';

const FeaturedCategories = lazy(() => import('../components/Categories/FeaturedCategories/FeaturedCategories'));
const FeaturedProducts = lazy(() => import('../components/Products/FeaturedProducts/FeaturedProducts'));
const Newsletter = lazy(() => import('../components/Newsletter/Newsletter'));
const AboutSection = lazy(() => import('../components/About/AboutSection'));

const SectionPlaceholder = ({ minHeight = 320 }) => (
  <div
    className="w-full animate-pulse rounded-2xl bg-[var(--color-bg-secondary)]"
    style={{ minHeight }}
    aria-hidden="true"
  />
);

const DeferredSection = ({ children, minHeight = 320, rootMargin = '240px' }) => {
  const containerRef = useRef(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (shouldRender) {
      return undefined;
    }

    const node = containerRef.current;
    if (!node) {
      return undefined;
    }

    if (!('IntersectionObserver' in window)) {
      setShouldRender(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [rootMargin, shouldRender]);

  return (
    <div ref={containerRef}>
      {shouldRender ? (
        <Suspense fallback={<SectionPlaceholder minHeight={minHeight} />}>
          {children}
        </Suspense>
      ) : (
        <SectionPlaceholder minHeight={minHeight} />
      )}
    </div>
  );
};

const hasFeaturedProductSource = (section) =>
  Boolean(
    section &&
    (
      (Array.isArray(section.selectedProductIds) && section.selectedProductIds.length > 0) ||
      (typeof section.category === 'string' && section.category.trim())
    )
  );

const HomePage = () => {
  const API_URL = getApiUrl();
  const FEATURED_COLLECTIONS_CACHE_KEY = 'homepage_featured_collections_v1';

  const [featuredCategoriesConfig, setFeaturedCategoriesConfig] = useState(null);
  const [featuredProductsConfig, setFeaturedProductsConfig] = useState([]);
  const [featuredCollectionsLoaded, setFeaturedCollectionsLoaded] = useState(false);

  /**
   * Keep homepage top-of-page work minimal
   */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /**
   * Load featured collections once on component mount
   */
  useEffect(() => {
    let cancelled = false;

    const loadFeaturedCollections = async () => {
      try {
        const data = await cachedJsonFetch(`${API_URL}/api/settings/featured-collections`, { cache: 'no-cache' });
        if (cancelled) {
          return;
        }
        sessionStorage.setItem(FEATURED_COLLECTIONS_CACHE_KEY, JSON.stringify(data));
        setFeaturedCategoriesConfig(data?.featuredCategories || null);
        setFeaturedProductsConfig(
          Array.isArray(data?.featuredProducts)
            ? data.featuredProducts.filter(hasFeaturedProductSource)
            : []
        );
      } catch (error) {
        if (!cancelled) {
          const cachedData = sessionStorage.getItem(FEATURED_COLLECTIONS_CACHE_KEY);
          if (cachedData) {
            try {
              const parsed = JSON.parse(cachedData);
              setFeaturedCategoriesConfig(parsed?.featuredCategories || null);
              setFeaturedProductsConfig([]);
            } catch {
              setFeaturedCategoriesConfig(null);
              setFeaturedProductsConfig([]);
            }
          } else {
            setFeaturedCategoriesConfig(null);
            setFeaturedProductsConfig([]);
          }
        }
      } finally {
        if (!cancelled) {
          setFeaturedCollectionsLoaded(true);
        }
      }
    };
    loadFeaturedCollections();

    return () => {
      cancelled = true;
    };
  }, [API_URL]);

  return (
    <>
      <Helmet>
        <title>Wolf Supplies | Premium Quality Products, Fast UK Delivery & 31-Day Returns</title>
        <meta name="description" content="Shop premium products with fast UK delivery and 31-day returns. High-quality items at competitive prices. Wolf Supplies - Your trusted online store." />
        <meta name="keywords" content="products, online shopping, UK delivery, premium quality, Wolf Supplies" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://wolfsupplies.co.uk/" />
        <meta property="og:title" content="Wolf Supplies | Premium Quality Products, Fast UK Delivery & 31-Day Returns" />
        <meta property="og:description" content="Shop premium products with fast UK delivery and 31-day returns. High-quality items at competitive prices." />
        <meta property="og:image" content="https://wolfsupplies.co.uk/og-image.jpg" />
        <meta property="og:url" content="https://wolfsupplies.co.uk/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Wolf Supplies | Premium Quality Products" />
        <meta name="twitter:description" content="Shop premium products with fast UK delivery and 31-day returns." />
      </Helmet>
      <Layout showMenuSlider={true}>
        <div className="w-full bg-white">


          {/* Features Section */}
          <FeaturesSection />

          {/* Featured Categories */}
          <section className="py-4 px-4">
            <DeferredSection minHeight={420}>
              <FeaturedCategories editorContent={featuredCategoriesConfig} />
            </DeferredSection>
          </section>

          {/* Featured Products */}
          {featuredCollectionsLoaded && featuredProductsConfig.length > 0 ? (
            featuredProductsConfig.map((productConfig, index) => (
              <section key={`prod-${index}`} className="py-4 px-4">
                <DeferredSection minHeight={620}>
                  <FeaturedProducts editorContent={productConfig} />
                </DeferredSection>
              </section>
            ))
          ) : (
            !featuredCollectionsLoaded && <section className="py-4 px-4">
              <SectionPlaceholder minHeight={620} />
            </section>
          )}



          {/* Newsletter */}
          <section className="py-4 px-4">
            <DeferredSection minHeight={360}>
              <Newsletter />
            </DeferredSection>
          </section>

          {/* About */}
          <section>
            <DeferredSection minHeight={520}>
              <AboutSection />
            </DeferredSection>
          </section>



        </div>
      </Layout>
    </>
  );
};

export default HomePage;
