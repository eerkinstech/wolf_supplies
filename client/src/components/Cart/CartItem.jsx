import React from 'react';


const API = import.meta.env.VITE_API_URL || '';

const getImgSrc = (img) => {
  if (!img) return null;

  // If array, use first usable entry
  if (Array.isArray(img)) {
    const first = img.find((x) => !!x);
    return getImgSrc(first);
  }

  // If object, try common fields
  if (typeof img === 'object') {
    const url = img.url || img.secure_url || img.path || img.src || img.public_id || img.location;
    if (!url) return null;
    return typeof url === 'string' ? (url.startsWith('http') ? url : `${API}${url}`) : null;
  }

  // string
  if (typeof img === 'string') {
    return img.startsWith('http') ? img : `${API}${img}`;
  }

  return null;
};

const CartItem = ({ item, onRemove, onUpdateQuantity, index, isLast }) => {
  return (
    <>
      <div className="p-6 sm:p-8 transition duration-300" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        {/* Product Main Info */}
        <div className="flex flex-col sm:flex-row gap-6 mb-4">
          {/* Product Image */}
          <div className="relative w-32 h-32 rounded-xl flex-shrink-0 overflow-hidden group flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-section)', borderColor: 'var(--color-border-light)' }}>
            {getImgSrc(item.image) ? (
              <img
                src={getImgSrc(item.image)}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-300 rounded-xl"
              />
            ) : (
              <div className="text-4xl">🛍️</div>
            )}

          </div>

          {/* Product Details */}
          <div className="grow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-xl mb-1" style={{ color: 'var(--color-text-primary)' }}>{item.name}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded" style={{ backgroundColor: 'var(--color-accent-primary)', color: 'white' }}>VAT 0%</span>
                </div>
              </div>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-accent-primary)' }}>£{Number(item.price).toFixed(2)}</p>
            </div>

            {/* Variants Display */}
            {(item.selectedSize || item.selectedColor || (item.selectedVariants && Object.keys(item.selectedVariants).length > 0)) && (
              <div className="mt-4 pt-4" style={{ borderColor: 'var(--color-border-light)', borderTopWidth: '1px' }}>
                <div className="grid grid-cols-2 gap-3">
                  {item.selectedSize && (
                    <div className="flex items-center gap-2">
                      <i className="fas fa-box text-sm" style={{ color: 'var(--color-accent-primary)' }}></i>
                      <span className="text-sm">
                        <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Size:</span>
                        <span className="ml-1" style={{ color: 'var(--color-text-secondary)' }}>{item.selectedSize}</span>
                      </span>
                    </div>
                  )}
                  {item.selectedColor && (
                    <div className="flex items-center gap-2">
                      <i className="fas fa-tag text-sm" style={{ color: 'var(--color-accent-primary)' }}></i>
                      <span className="text-sm">
                        <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Color:</span>
                        <span className="ml-1" style={{ color: 'var(--color-text-secondary)' }}>{item.selectedColor}</span>
                      </span>
                    </div>
                  )}
                  {item.selectedVariants && Object.entries(item.selectedVariants).filter(([_, v]) => v).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <i className="fas fa-check text-sm" style={{ color: 'var(--color-accent-primary)' }}></i>
                      <span className="text-sm">
                        <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{key}:</span>
                        <span className="ml-1" style={{ color: 'var(--color-text-secondary)' }}>{value}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quantity & Total Row */}
        <div className="flex sm:flex-row sm:items-center justify-between gap-4 pt-4" style={{ borderColor: 'var(--color-border-light)', borderTopWidth: '1px' }}>
          {/* Quantity Control */}
          <div className="flex items-center rounded-lg w-fit" style={{ borderWidth: '2px', borderColor: 'var(--color-border-light)', backgroundColor: 'var(--color-bg-primary)' }}>
            <button
              onClick={() => onUpdateQuantity(item._id, item.quantity - 1)}
              className="px-3 py-2 font-bold text-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ color: 'var(--color-accent-primary)' }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = 'var(--color-bg-section)')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
              disabled={item.quantity <= 1}
            >
              −
            </button>
            <span className="px-3 py-2 font-bold text-lg w-10 text-center" style={{ borderLeftWidth: '2px', borderRightWidth: '2px', borderColor: 'var(--color-border-light)', color: 'var(--color-text-primary)' }}>{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
              className="px-3 py-2 font-bold text-lg transition duration-300"
              style={{ color: 'var(--color-accent-primary)' }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = 'var(--color-bg-section)')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
            >
              +
            </button>
          </div>

          {/* Price Info */}
          <div className="flex items-center justify-between sm:justify-end gap-8">
            <div className="text-right">
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Subtotal</p>
              <p className="font-bold text-2xl" style={{ color: 'var(--color-accent-primary)' }}>£{(Number(item.price) * item.quantity).toFixed(2)}</p>
            </div>
          </div>

          {/* Remove Button */}
          <button
            onClick={() => {
              try {
                if (typeof onRemove === 'function') onRemove(item._id);
              } catch (err) {
}
            }}
            className="w-16 sm:w-auto px-4 py-2 font-semibold flex items-center justify-center gap-2 transition duration-300 rounded-lg"
            style={{
              borderWidth: '2px',
              borderColor: 'var(--color-border-light)',
              color: 'var(--color-accent-primary)'
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = 'var(--color-bg-section)')
            }
            onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
          >
            <i className="fas fa-trash text-sm"></i>
          </button>
        </div>
      </div>
      {!isLast && <div style={{ borderBottomColor: 'var(--color-border-light)', borderBottomWidth: '1px' }}></div>}
    </>
  );
};

export { CartItem };
export default CartItem;
