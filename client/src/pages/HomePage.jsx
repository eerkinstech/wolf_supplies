'use client';

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/Layout/Layout';
import FeaturedCategories from '../components/Categories/FeaturedCategories/FeaturedCategories';
import FeaturedProducts from '../components/Products/FeaturedProducts/FeaturedProducts';
import Newsletter from '../components/Newsletter/Newsletter';
import AboutSection from '../components/About/AboutSection';
import FeaturesSection from '../components/Features/FeaturesSection';
import { useDispatch } from 'react-redux';
import { fetchProducts } from '../redux/slices/productSlice';
import { fetchCategories } from '../redux/slices/categorySlice';

const HomePage = () => {
  const dispatch = useDispatch();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const [featuredCategoriesConfig, setFeaturedCategoriesConfig] = useState(null);
  const [featuredProductsConfig, setFeaturedProductsConfig] = useState([]);

  /**
   * Load home page data once on component mount
   */
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts());
    window.scrollTo(0, 0);
  }, [dispatch]);

  /**
   * Load featured collections once on component mount
   */
  useEffect(() => {
    const loadFeaturedCollections = async () => {
      try {
        const response = await fetch(`${API_URL}/api/settings/featured-collections`);
        const data = await response.json();
        setFeaturedCategoriesConfig(data?.featuredCategories || null);
        setFeaturedProductsConfig(
          Array.isArray(data?.featuredProducts) ? data.featuredProducts : []
        );
      } catch (error) {
      }
    };

    loadFeaturedCollections();
  }, []);

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
            <FeaturedCategories editorContent={featuredCategoriesConfig} />
          </section>

          {/* Featured Products */}
          {featuredProductsConfig && featuredProductsConfig.length > 0 ? (
            featuredProductsConfig.map((productConfig, index) => (
              <section key={`prod-${index}`} className="py-4 px-4">
                <FeaturedProducts editorContent={productConfig} />
              </section>
            ))
          ) : (
            <section className="py-4 px-4">
              <FeaturedProducts />
            </section>
          )}



          {/* Newsletter */}
          <section className="py-4 px-4">
            <Newsletter />
          </section>

          {/* About */}
          <section>
            <AboutSection />
          </section>



        </div>
      </Layout>
    </>
  );
};

export default HomePage;
