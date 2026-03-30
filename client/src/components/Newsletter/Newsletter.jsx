import React, { useState } from 'react';

import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '';

const Newsletter = ({ content = {} }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Get content with defaults
  const layout = content.layout || 'layout1';
  const title = content.title || 'Get the best deals in your inbox';
  const subtitle = content.subtitle || '';
  const description = content.description || 'Sign up for exclusive offers, new arrivals, and seasonal sales.';
  const inputPlaceholder = content.inputPlaceholder || 'Enter Your Email Address';
  const buttonText = content.buttonText || 'Subscribe';
  const successTitle = content.successTitle || "You're subscribed!";
  const successMessage = content.successMessage || 'Thanks — check your email for the welcome offer.';
  const bgColor = content.bgColor || 'var(--color-bg-section)';
  const accentColor = content.accentColor || 'var(--color-accent-primary)';
  const textColor = content.textColor || 'var(--color-text-primary)';
  const padding = content.padding || 10;
  const borderRadius = content.borderRadius || 16;
  const benefits = content.benefits || [
    { id: '1', title: 'No Spam', description: 'Only curated deals' },
    { id: '2', title: 'Early Access', description: 'Subscriber-only previews' },
    { id: '3', title: 'Easy Opt-out', description: 'One click to unsubscribe' }
  ];

  const handleSubscribe = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if email is already subscribed (409 Conflict or message contains "already")
        const isAlreadySubscribed =
          response.status === 409 ||
          data.message?.toLowerCase().includes('already') ||
          data.message?.toLowerCase().includes('exists');

        if (isAlreadySubscribed) {
          toast.success('This email is already subscribed to our newsletter');
        } else {
          toast.error(data.message || 'Failed to subscribe');
        }
        setIsLoading(false);
        return;
      }

      setIsLoading(false);

      // Check if email was already subscribed or newly subscribed
      const isAlreadySubscribed = data.message?.toLowerCase().includes('already');
      const isResubscribed = data.message?.toLowerCase().includes('resubscribed');

      if (isAlreadySubscribed) {
        toast.success('This email is already subscribed to our newsletter');
      } else if (isResubscribed) {
        toast.success('Welcome back! You have been resubscribed to our newsletter');
        setIsSubscribed(true);
      } else {
        toast.success('Successfully subscribed to our newsletter!');
        setIsSubscribed(true);
      }

      setEmail('');

      if (!isAlreadySubscribed) {
        setTimeout(() => {
          setIsSubscribed(false);
        }, 3000);
      }
    } catch (error) {
      setIsLoading(false);
      toast.error('Failed to subscribe. Please try again.');
    }
  };

  // ====== LAYOUT 1: Vertical with Icon ======
  if (layout === 'layout1') {
    return (
      <section style={{
        padding: `${padding}px 16px`,
        background: 'var(--color-bg-primary)',
        backgroundColor: 'var(--color-bg-primary)'
      }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <div style={{ backgroundColor: 'var(--color-bg-secondary)', padding: '16px', borderRadius: '9999px' }}>
                <i className="fas fa-envelope" style={{ fontSize: '36px', color: 'var(--color-accent-primary)' }}></i>
              </div>
            </div>

            <h2 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: 'var(--color-text-primary)',
              marginBottom: '8px'
            }}>
              {title}
            </h2>
            {subtitle && <p style={{ color: 'var(--color-text-secondary)', marginBottom: '12px', fontSize: '18px' }}>{subtitle}</p>}
            <p style={{ color: 'var(--color-text-secondary)', maxWidth: '512px', margin: '0 auto' }}>{description}</p>
          </div>

          <div style={{
            backgroundColor: 'var(--color-bg-primary)',
            borderRadius: `${borderRadius}px`,
            border: '1px solid var(--color-border-light)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            padding: '40px'
          }}>
            {!isSubscribed ? (
              <form onSubmit={handleSubscribe} className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                  <div className="flex-1 w-full">
                    <label className="sr-only">Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={inputPlaceholder}
                      style={{
                        width: '100%',
                        padding: '12px 20px',
                        border: `2px solid var(--color-border-light)`,
                        borderRadius: '8px',
                        fontSize: '16px',
                        outline: 'none',
                        color: 'var(--color-text-primary)'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-primary)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--color-border-light)'}
                      disabled={isLoading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                    style={{

                      backgroundColor: 'var(--color-accent-primary)',
                      color: 'white',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      border: 'none',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      justifyContent: 'center',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                        Subscribing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane"></i>
                        {buttonText}
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap gap-6 pt-6 border-t justify-between border-[var(--color-border-light)]">
                  {benefits.map((benefit) => (
                    <div key={benefit.id} className="flex items-center gap-3">
                      <div style={{ backgroundColor: 'var(--color-bg-secondary)', padding: '12px', borderRadius: '9999px' }}>
                        <i className="fas fa-check-circle" style={{ color: 'var(--color-accent-primary)', fontSize: '18px' }}></i>
                      </div>
                      <div>
                        <p style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{benefit.title}</p>
                        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="mb-4 flex justify-center">
                  <div style={{ backgroundColor: 'var(--color-bg-secondary)', padding: '12px', borderRadius: '9999px' }}>
                    <i className="fas fa-check-circle" style={{ fontSize: '32px', color: 'var(--color-success)' }}></i>
                  </div>
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                  {successTitle}
                </h3>
                <p style={{ color: 'var(--color-text-secondary)' }}>{successMessage}</p>
              </div>
            )}
          </div>


        </div>
      </section>
    );
  }

  // ====== LAYOUT 2: Two Columns - Image Left, Content Right ======
  if (layout === 'layout2') {
    const imageColWidth = content.imageColWidth || 35;
    const contentColWidth = 100 - imageColWidth;

    return (
      <section style={{
        padding: `${padding}px 16px`,
        backgroundColor: bgColor
      }}>
        <div className="max-w-7xl mx-auto">
          <div style={{

            display: 'flex',
            gap: '0',
            backgroundColor: 'var(--color-bg-primary)',
            borderRadius: `${borderRadius}px`,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid var(--color-border-light)',
            overflow: 'hidden',
            minHeight: '320px'
          }}>
            {/* Column 1: Image (Left) */}
            <div style={{
              flex: `0 0 ${imageColWidth}%`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
              backgroundColor: 'var(--color-bg-section)',
              borderRight: '1px solid var(--color-border-light)'
            }}>
              {content.logoImage ? (
                <>
                  <img
                    src={content.logoImage}
                    alt="Newsletter Logo"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '240px',
                      height: 'auto',
                      objectFit: 'contain',
                      width: '100%'
                    }}
                    onError={(e) => {
                    }}
                    onLoad={() => { }}
                  />
                </>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'var(--color-border-light)',
                  borderRadius: '8px',
                  color: 'var(--color-text-light)',
                  fontSize: '14px',
                  fontWeight: '500',
                  minHeight: '240px'
                }}>
                  No Image
                </div>
              )}
            </div>

            {/* Column 2: Content (Right) */}
            <div style={{
              flex: `0 0 ${contentColWidth}%`,
              display: 'flex',
              flexDirection: 'column',
              padding: '40px',
              justifyContent: 'center',
              gap: '20px'
            }}>
              {/* Title and Description */}
              <div>
                <h2 style={{
                  fontSize: '26px',
                  fontWeight: 'bold',
                  color: textColor,
                  marginBottom: '12px',
                  lineHeight: '1.3'
                }}>
                  {title}
                </h2>
                <p style={{
                  color: 'var(--color-text-light)',
                  margin: '0',
                  fontSize: '15px',
                  lineHeight: '1.6'
                }}>
                  {description}
                </p>
              </div>

              {/* Email Input and Button */}
              {!isSubscribed ? (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 sm:gap-3 sm:items-center">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={inputPlaceholder}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: `1px solid var(--color-border-light)`,
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--color-border-light)'}
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                    style={{
                      backgroundColor: accentColor,
                      color: 'white',
                      padding: '12px 24px',
                      borderRadius: '6px',
                      fontWeight: '600',
                      border: 'none',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.6 : 1,
                      fontSize: '14px',
                      whiteSpace: 'nowrap',
                      minWidth: '110px'
                    }}
                  >
                    {isLoading ? 'Subscribing...' : buttonText}
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: 'center', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                    <div style={{ backgroundColor: `${accentColor}20`, padding: '10px', borderRadius: '9999px' }}>
                      <i className="fas fa-check-circle" style={{ fontSize: '24px', color: accentColor }}></i>
                    </div>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: textColor, margin: '0 0 4px 0' }}>
                    {successTitle}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-light)', margin: '0' }}>{successMessage}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ====== LAYOUT 3: Simple Stack ======
  if (layout === 'layout3') {
    return (
      <section style={{
        padding: `${padding}px 16px`,
        backgroundColor: bgColor
      }}>
        <div className="max-w-2xl mx-auto">
          <div style={{
            backgroundColor: 'var(--color-bg-primary)',
            borderRadius: `${borderRadius}px`,
            padding: '40px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            {/* Title */}
            <h2 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: textColor,
              marginBottom: '12px',
              textAlign: 'center'
            }}>
              {title}
            </h2>

            {/* Description */}
            <p style={{
              fontSize: '16px',
              color: 'var(--color-text-light)',
              marginBottom: '24px',
              textAlign: 'center',
              margin: '0 0 24px 0'
            }}>
              {description}
            </p>

            {/* Email Form */}
            {!isSubscribed ? (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={inputPlaceholder}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: `2px solid var(--color-border-light)`,
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-border-light)'}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    backgroundColor: accentColor,
                    color: 'white',
                    padding: '14px 20px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.6 : 1,
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      {buttonText}
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div className="mb-3 flex justify-center">
                  <div style={{ backgroundColor: `${accentColor}20`, padding: '12px', borderRadius: '9999px' }}>
                    <i className="fas fa-check-circle" style={{ fontSize: '28px', color: accentColor }}></i>
                  </div>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: textColor, marginBottom: '8px' }}>
                  {successTitle}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--color-text-light)' }}>{successMessage}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  return null;
};

export default Newsletter;
