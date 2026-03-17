import React from 'react';

const ProductList = ({ products }) => {
  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div key={product._id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition duration-300">
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0">
              <img
                src={product.image || '🛍️'}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="flex-grow">
              <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-bold text-lg">£{product.price}</span>
                <span className="text-gray-900 text-sm">Stock: {product.stock}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
