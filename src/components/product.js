import React, { useState } from 'react';

const productsData = {
    electronics: [
        { id: 1, name: 'Laptop', price: '$1000' },
        { id: 2, name: 'Smartphone', price: '$500' },
    ],
    clothing: [
        { id: 3, name: 'T-Shirt', price: '$20' },
        { id: 4, name: 'Jeans', price: '$40' },
    ],
};

const ProductCard = ({ product }) => (
    <div className="product-card">
        <h3>{product.name}</h3>
        <p>{product.price}</p>
    </div>
);

const ProductList = ({ category }) => {
    const products = productsData[category] || [];
    return (
        <div className="product-list">
            {products.map(product => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
};

const ProductComponent = () => {
    const [selectedCategory, setSelectedCategory] = useState(null);

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
    };

    return (
        <div>
            <div className="categories">
                <button onClick={() => handleCategoryClick('electronics')}>Electronics</button>
                <button onClick={() => handleCategoryClick('clothing')}>Clothing</button>
            </div>
            {selectedCategory && <ProductList category={selectedCategory} />}
        </div>
    );
};

export default ProductComponent;