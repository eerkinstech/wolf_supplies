import React from 'react';


const SEOMetaForm = ({ metaTitle, metaDescription, metaKeywords, onChange, defaultTitle = '' }) => {
  const maxTitleLength = 60;
  const maxDescriptionLength = 160;
  const maxKeywordsLength = 160;

  const titleLength = (metaTitle || '').length;
  const descriptionLength = (metaDescription || '').length;
  const keywordsLength = (metaKeywords || '').length;

  const getTitleStatus = () => {
    if (titleLength === 0) return 'text-gray-400';
    if (titleLength < 30) return 'text-orange-500';
    if (titleLength > maxTitleLength) return 'text-red-500';
    return 'text-green-500';
  };

  const getDescriptionStatus = () => {
    if (descriptionLength === 0) return 'text-gray-400';
    if (descriptionLength < 120) return 'text-orange-500';
    if (descriptionLength > maxDescriptionLength) return 'text-red-500';
    return 'text-green-500';
  };

  return (
    <div className="border-t pt-6 mt-6">
      <div className="flex items-center gap-2 mb-6">
        <i className="fas fa-info-circle text-blue-500"></i>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>SEO Meta Information</h3>
      </div>

      {/* Meta Title */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Meta Title
        </label>
        <input
          type="text"
          value={metaTitle || defaultTitle}
          onChange={(e) => onChange('metaTitle', e.target.value)}
          placeholder="Enter SEO title (shown in search results)"
          maxLength={maxTitleLength}
          className="w-full px-4 py-2 border rounded-lg"
          style={{
            borderColor: 'var(--color-border-light)',
            backgroundColor: 'var(--color-bg-section)'
          }}
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs" style={{ color: 'var(--color-text-light)' }}>
            Used in browser tabs and search results
          </p>
          <span className={`text-xs font-semibold ${getTitleStatus()}`}>
            {titleLength}/{maxTitleLength}
          </span>
        </div>
        {titleLength > 0 && titleLength < 30 && (
          <p className="text-xs text-orange-500 mt-1">Tip: Titles should be at least 30 characters for better SEO</p>
        )}
      </div>

      {/* Meta Description */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Meta Description
        </label>
        <textarea
          value={metaDescription || ''}
          onChange={(e) => onChange('metaDescription', e.target.value)}
          placeholder="Enter SEO description (shown in search results)"
          maxLength={maxDescriptionLength}
          rows={3}
          className="w-full px-4 py-2 border rounded-lg resize-none"
          style={{
            borderColor: 'var(--color-border-light)',
            backgroundColor: 'var(--color-bg-section)'
          }}
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs" style={{ color: 'var(--color-text-light)' }}>
            Displayed under the page title in search results
          </p>
          <span className={`text-xs font-semibold ${getDescriptionStatus()}`}>
            {descriptionLength}/{maxDescriptionLength}
          </span>
        </div>
        {descriptionLength > 0 && descriptionLength < 120 && (
          <p className="text-xs text-orange-500 mt-1">Tip: Descriptions should be 120-160 characters for best display</p>
        )}
      </div>

      {/* Meta Keywords */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Meta Keywords (Comma-separated)
        </label>
        <textarea
          value={metaKeywords || ''}
          onChange={(e) => onChange('metaKeywords', e.target.value)}
          placeholder="e.g., keyword1, keyword2, keyword3, keyword4"
          maxLength={maxKeywordsLength}
          rows={2}
          className="w-full px-4 py-2 border rounded-lg resize-none"
          style={{
            borderColor: 'var(--color-border-light)',
            backgroundColor: 'var(--color-bg-section)'
          }}
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs" style={{ color: 'var(--color-text-light)' }}>
            Relevant keywords to help with SEO ranking
          </p>
          <span className={`text-xs font-semibold ${keywordsLength === 0 ? 'text-gray-400' : 'text-green-500'}`}>
            {keywordsLength}/{maxKeywordsLength}
          </span>
        </div>
      </div>

      {/* SEO Preview */}
      {metaTitle || metaDescription ? (
        <div className="mt-6 p-4 border rounded-lg" style={{ borderColor: 'var(--color-border-light)', backgroundColor: 'var(--color-bg-primary)' }}>
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-light)' }}>SEO Preview:</p>
          <div className="text-sm" style={{ color: 'var(--color-accent-primary)' }}>
            <p className="font-semibold break-words whitespace-normal overflow-wrap break-word" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
              {metaTitle || defaultTitle}
            </p>
          </div>
          <p className="text-xs mt-1 break-words whitespace-normal overflow-wrap break-word" style={{ color: 'var(--color-text-light)', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
            {metaDescription || 'No description provided'}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default SEOMetaForm;
