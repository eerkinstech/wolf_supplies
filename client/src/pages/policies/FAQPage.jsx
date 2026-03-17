'use client';

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const PoliciesFAQPage = () => {
  const faqs = [
    {
      category: 'Shipping & Delivery',
      items: [
        {
          question: 'How long does shipping take?',
          answer: 'Standard UK delivery takes 2-4 business days from order confirmation. Processing time is 1 business day. We deliver to all UK postcodes including remote areas (which may take 1-2 additional days).'
        },
        {
          question: 'Is shipping free?',
          answer: 'Yes! We offer completely free standard shipping on all UK orders with no minimum spend. Shipping costs are included in all product prices displayed.'
        },
        {
          question: 'How can I track my order?',
          answer: 'You\'ll receive a tracking number via email once your order ships. You can track your package in real-time on our website and through our carrier\'s tracking page.'
        },
        {
          question: 'Where do you deliver?',
          answer: 'We deliver exclusively to the United Kingdom to all UK postcodes, including remote areas.'
        },
        {
          question: 'What carriers do you use?',
          answer: 'We partner with major UK carriers including Royal Mail, DPD, and other verified couriers. You\'ll receive tracking information for all shipments.'
        }
      ]
    },
    {
      category: 'Returns & Refunds',
      items: [
        {
          question: 'What is your return policy?',
          answer: 'You have 31 days from delivery to return unused items in original packaging for a full refund. Under the UK Consumer Rights Act 2015, you also have 14 days to cancel for any reason. For defective items, you have statutory rights to repair, replacement, or refund under consumer protection law.'
        },
        {
          question: 'How long does a refund take?',
          answer: 'Once received and inspected (3-5 business days), we process refunds within 1-2 business days. Refunds appear in your account within 5-10 business days depending on your bank.'
        },
        {
          question: 'Do I have to pay for return shipping?',
          answer: 'For defective or incorrectly sent items, return shipping is free (we provide prepaid labels). For unwanted items, return shipping is at your cost unless legally required otherwise.'
        },
        {
          question: 'What if my item arrives damaged?',
          answer: 'Report damage within 48 hours with photos. We\'ll immediately send a replacement or issue a full refund at no cost, including return shipping.'
        }
      ]
    },
    {
      category: 'Orders & Payments',
      items: [
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, and Google Pay. All payments are processed securely through Stripe, a leading payment provider.'
        },
        {
          question: 'Is my payment information safe?',
          answer: 'Yes! All payments are encrypted using SSL/TLS technology and processed through Stripe. We never store full card details on our servers. Your payment information is protected to industry standards.'
        },
        {
          question: 'Can I change my order after placing it?',
          answer: 'If your order hasn\'t shipped, we may be able to modify or cancel it. Contact us immediately at sales@wolfsupplies.co.uk within 1 business day of placing your order.'
        },
        {
          question: 'What happens if an item is out of stock?',
          answer: 'If an item becomes unavailable after purchase, we\'ll notify you immediately and offer a full refund or alternative product at no extra cost.'
        }
      ]
    },
    {
      category: 'Privacy & Security',
      items: [
        {
          question: 'How do you protect my data?',
          answer: 'We comply with UK GDPR and Data Protection Act 2018. Your data is encrypted, securely stored, and never sold to third parties. See our Privacy Policy for full details.'
        },
        {
          question: 'Can I request a copy of my data?',
          answer: 'Yes! Under UK GDPR, you have the right to access your data. Email sales@wolfsupplies.co.uk with proof of identity, and we\'ll provide your data within 30 days.'
        },
        {
          question: 'How long do you keep my information?',
          answer: 'We retain order data as long as legally required (6+ years for tax purposes). Personal data for marketing is kept until you opt-out. See our Privacy Policy for full details.'
        }
      ]
    },
    {
      category: 'Products & Information',
      items: [
        {
          question: 'Are product descriptions accurate?',
          answer: 'Yes! All product descriptions are verified for accuracy. If a product doesn\'t match the description, you can return it within 31 days for a full refund.'
        },
        {
          question: 'Do you have a warranty on products?',
          answer: 'All products come with UK Consumer Rights guarantees (quality, fitness for purpose). Manufacturer warranties vary by product—check product details for specifics.'
        },
        {
          question: 'Are all products brand new?',
          answer: 'Unless otherwise stated, all our products are brand new and in original packaging. Any refurbished items are clearly labeled as such with warranty information provided.'
        }
      ]
    },
    {
      category: 'Customer Support',
      items: [
        {
          question: 'How do I contact customer support?',
          answer: 'Email: sales@wolfsupplies.co.uk | Phone: +44 7398 998101 | Monday-Friday, 9 AM - 6 PM GMT'
        },
        {
          question: 'What are your customer support hours?',
          answer: 'We\'re available Monday to Friday, 9 AM to 6 PM GMT. We aim to respond to all emails within 24 hours.'
        },
        {
          question: 'Do you offer live chat support?',
          answer: 'Live chat is available during business hours (9 AM - 6 PM GMT, Monday-Friday). Email and phone support available during these times as well.'
        }
      ]
    },
    {
      category: 'Legal & Compliance',
      items: [
        {
          question: 'What laws protect me as a UK customer?',
          answer: 'You\'re protected under the Consumer Rights Act 2015, Consumer Contracts Regulations 2013, and UK GDPR. These give you rights to quality products, clear information, cooling-off period, and data protection.'
        },
        {
          question: 'What is your company registration number?',
          answer: 'Wolf Suppliesis registered at Companies House with Company Number 16070029. Address: Unit 4 Atlas Estates, Colebrook Road, Birmingham, West Midlands, B11 2NT, UK.'
        },
        {
          question: 'What if I have a dispute?',
          answer: 'We encourage you to contact us first. If unresolved, you may use Alternative Dispute Resolution, refer to Trading Standards, or contact your local consumer protection authority.'
        }
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Frequently Asked Questions | Wolf Supplies</title>
        <meta name="description" content="Find answers to common questions about Wolf Supplies — shipping, returns, payments, privacy, and more." />
        <meta name="keywords" content="Wolf Supplies FAQ, frequently asked questions, shipping, returns, refunds, UK delivery" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://wolfsupplies.co.uk/policies/faq" />
        <meta property="og:title" content="Frequently Asked Questions | Wolf Supplies" />
        <meta property="og:description" content="Find answers to common questions about Wolf Supplies — shipping, returns, payments, privacy, and more." />
        <meta property="og:image" content="https://wolfsupplies.co.uk/default-image.jpg" />
        <meta property="og:url" content="https://wolfsupplies.co.uk/policies/faq" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Frequently Asked Questions | Wolf Supplies" />
        <meta name="twitter:description" content="Find answers to common questions about Wolf Supplies — shipping, returns, payments, privacy, and more." />
      </Helmet>
      <div className="min-h-screen bg-[var(--color-bg-section)]">
      {/* Header Section */}
      <div className="bg-[var(--color-accent-primary)] text-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 mb-4 hover:text-gray-100 w-fit">
            <i className="fas fa-arrow-left"></i> Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <i className="fas fa-question-circle text-4xl"></i>
            <h1 className="text-4xl md:text-5xl font-bold">Frequently Asked Questions</h1>
          </div>
          <p className="text-gray-100 text-lg">Your Complete Guide to Shopping with Wolf Supplies</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {faqs.map((faqGroup, groupIdx) => (
          <div key={groupIdx} className="mb-12">
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6 pb-3 border-b-2 border-[var(--color-accent-primary)]">
              {faqGroup.category}
            </h2>
            <div className="space-y-4">
              {faqGroup.items.map((faq, idx) => (
                <details
                  key={idx}
                  className="bg-[var(--color-bg-primary)] rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition duration-300 group"
                >
                  <summary className="flex items-center justify-between font-bold text-[var(--color-text-primary)] text-lg select-none">
                    <span>{faq.question}</span>
                    <span className="text-[var(--color-text-light)] transition duration-300 group-open:rotate-180">▼</span>
                  </summary>
                  <p className="text-[var(--color-text-light)] mt-4 leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        ))}

        {/* Still Have Questions */}
        <div className="bg-[var(--color-bg-section)] rounded-lg border-2 border-[var(--color-border-light)] p-8 mt-12">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">Didn't Find Your Answer?</h2>
          <p className="text-[var(--color-text-light)] mb-6">
            Our support team at Wolf Suppliesis here to help with any questions or concerns you may have.
          </p>
          <div className="space-y-2 text-[var(--color-text-light)] mb-6">
            <p><i className="fas fa-envelope inline mr-2" style={{ color: 'var(--color-accent-primary)' }}></i> Email: <a href="mailto:sales@wolfsupplies.co.uk" className="text-[var(--color-accent-primary)] hover:underline">sales@wolfsupplies.co.uk</a></p>
            <p><i className="fas fa-phone inline mr-2" style={{ color: 'var(--color-accent-primary)' }}></i> Phone: <a href="tel:+447398998101" className="text-[var(--color-accent-primary)] hover:underline">+44 7398 998101</a></p>
            <p>⏰ Hours: Monday - Friday, 9 AM - 6 PM GMT</p>
          </div>
          <div className="bg-[var(--color-bg-primary)] p-4 rounded border border-[var(--color-border-light)]">
            <p className="text-sm text-[var(--color-text-light)]"><strong>Company Details:</strong></p>
            <p className="text-sm text-[var(--color-text-light)]">Wolf Supplies</p>
            <p className="text-sm text-[var(--color-text-light)]">Company Number: <a href="https://find-and-update.company-information.service.gov.uk/company/16070029" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-primary)] hover:underline">16070029</a></p>
            <p className="text-sm text-[var(--color-text-light)]">Unit 4 Atlas Estates, Colebrook Road, Birmingham, West Midlands, B11 2NT, United Kingdom</p>
          </div>
        </div>
      </div>
    </div>
      </>
  );
};

export default PoliciesFAQPage;
