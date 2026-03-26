'use client';

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { cachedJsonFetch } from '@/utils/apiCache';
import icons from '../../assets/Strip Logos.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [footerMenu, setFooterMenu] = useState([]);
  const [policiesMenu, setPoliciesMenu] = useState([]);

  // Load footer and policies menus from server (cached per session)
  useEffect(() => {
    const loadMenus = async () => {
      try {
        const API = import.meta.env.VITE_API_URL || '';
        const url = API ? `${API}/api/settings/menus` : '/api/settings/menus';
        const data = await cachedJsonFetch(url);
        if (data.footerMenu && Array.isArray(data.footerMenu)) {
          setFooterMenu(data.footerMenu);
        }
        if (data.policiesMenu && Array.isArray(data.policiesMenu)) {
          setPoliciesMenu(data.policiesMenu);
        }
      } catch (err) {
      }
    };
    loadMenus();
  }, []);

  return (
    <>

      <footer className="bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <img src="/Wolf Supplies LTD.png" alt="Wolf Supplies" className="h-auto w-auto object-cover" />
              </h3>
              <p className="text-[var(--color-text-light)] mb-4">Wolf Supplies a company registered in the United Kingdom. Your trusted UK online shopping destination for quality products at competitive prices.</p>
              <p className="text-[var(--color-text-primary)] text-sm mb-2"><strong>Company Number:</strong> <a href="https://find-and-update.company-information.service.gov.uk/company/16070029" target="_blank" rel="noopener noreferrer" className="text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)]">16070029</a></p>

            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {footerMenu && footerMenu.length > 0 ? (
                  footerMenu.map((item) => (
                    <li key={item.id || item.name}>
                      <Link to={item.url || item.link || '#'} className="text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] transition duration-300">
                        {item.label || item.name}
                      </Link>
                    </li>
                  ))
                ) : (
                  <>
                    <li>
                      <Link to="/" className="text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] transition duration-300">
                        Home
                      </Link>
                    </li>
                    <li>
                      <Link to="/products" className="text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] transition duration-300">
                        Products
                      </Link>
                    </li>
                    <li>
                      <Link to="/about" className="text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] transition duration-300">
                        About Us
                      </Link>
                    </li>
                    <li>
                      <Link to="/contact" className="text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] transition duration-300">
                        Contact Us
                      </Link>
                    </li>
                    <li>
                      <Link to="/payment-options" className="text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] transition duration-300">
                        Payment Options
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Policies & Information */}
            <div>
              <h4 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">Policies & Info</h4>
              <ul className="space-y-2">
                {policiesMenu && policiesMenu.length > 0 ? (
                  policiesMenu.map((item) => (
                    <li key={item.id || item.name}>
                      <Link to={item.url || item.link || '#'} className="text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] transition duration-300">
                        {item.label || item.name}
                      </Link>
                    </li>
                  ))
                ) : (
                  <>
                    <li>
                      <Link to="/policies/shipping" className="text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] transition duration-300">
                        Shipping Policy
                      </Link>
                    </li>
                    <li>
                      <Link to="/policies/returns" className="text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] transition duration-300">
                        Return & Refunds
                      </Link>
                    </li>
                    <li>
                      <Link to="/policies/privacy" className="text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] transition duration-300">
                        Privacy Policy
                      </Link>
                    </li>
                    <li>
                      <Link to="/policies/terms" className="text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] transition duration-300">
                        Terms of Service
                      </Link>
                    </li>
                    <li>
                      <Link to="/policies/faq" className="text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] transition duration-300">
                        FAQ
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">Contact Us</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-[var(--color-text-light)]">
                  <i className="fas fa-phone text-black"></i>
                  <a href="tel:+447398998101" className="hover:text-black text-sm">+44 7398 998101</a>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <i className="fas fa-envelope text-black"></i>
                  <a href="mailto:sales@wolfsupplies.co.uk" className="hover:text-black text-sm">sales@wolfsupplies.co.uk</a>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <i className="fas fa-map-marker-alt text-black mt-1"></i>
                  <div>
                    <p>Unit 4 Atlas Estates</p>
                    <p>Colebrook Road, Birmingham</p>
                    <p>West Midlands, B11 2NT</p>
                    <p>United Kingdom</p>
                  </div>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <i className="fas fa-globe text-black"></i>
                  <a href='https://wolfsupplies.co.uk' className="hover:text-black text-sm">wolfsupplies.co.uk</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Payment Methods & Logos Section */}
          <div className="border-t border-gray-300 py-8 mb-8">
            <h4 className="text-lg font-bold mb-6 text-center">We Accept</h4>
            <div className="flex justify-center mb-8">
              <img src={icons} alt="Payment Methods" className="h-10 object-contain" />
            </div>
            <div className="text-center">
              <Link to='/payment-options' className="text-[var(--color-accent-primary)] hover:text-[var(--color-accent-light)] transition duration-300 text-sm font-semibold">
                View All Payment Options
              </Link>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-[var(--color-border-light)] pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-[var(--color-text-light)]">
                &copy; {currentYear} Wolf Supplies. All rights reserved. Company Number: <a href="https://find-and-update.company-information.service.gov.uk/company/16070029" target="_blank" rel="noopener noreferrer" className="text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)]">16070029</a>
              </p>
              <div className="flex gap-4 flex-wrap justify-center">
                <Link to="/policies/privacy" className="text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] transition duration-300 text-sm">
                  Privacy Policy
                </Link>
                <span className="text-[var(--color-text-muted)]">|</span>
                <Link to="/policies/terms" className="text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] transition duration-300 text-sm">
                  Terms of Service
                </Link>
                <span className="text-[var(--color-text-muted)]">|</span>
                <Link to="/policies/shipping" className="text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] transition duration-300 text-sm">
                  Shipping Policy
                </Link>
                <span className="text-[var(--color-text-muted)]">|</span>
                <Link to="/policies/returns" className="text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] transition duration-300 text-sm">
                  Return & Refunds
                </Link>
                <span className="text-[var(--color-text-muted)]">|</span>
                <Link to="/policies/faq" className="text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] transition duration-300 text-sm">
                  FAQ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
