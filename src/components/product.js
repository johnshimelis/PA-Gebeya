import React, { useState } from 'react';

const productsData = {
    electronics: [
        { id: 1, name: 'Laptop', price: '$1000' },
        { id: 2, name: 'Smartphone', price: '$500' },
        { id: 3, name: 'Headphones', price: '$150' },
        { id: 4, name: 'Smartwatch', price: '$200' },
    ],
    clothing: [
        { id: 5, name: 'T-Shirt', price: '$20' },
        { id: 6, name: 'Jeans', price: '$40' },
        { id: 7, name: 'Jacket', price: '$60' },
        { id: 8, name: 'Sneakers', price: '$80' },
    ],
    home: [
        { id: 9, name: 'Sofa', price: '$500' },
        { id: 10, name: 'Table Lamp', price: '$30' },
        { id: 11, name: 'Cookware Set', price: '$120' },
    ],
    beauty: [
        { id: 12, name: 'Perfume', price: '$70' },
        { id: 13, name: 'Lipstick', price: '$15' },
        { id: 14, name: 'Face Cream', price: '$35' },
    ],
    baby: [
        { id: 15, name: 'Baby Stroller', price: '$150' },
        { id: 16, name: 'Diaper Pack', price: '$40' },
        { id: 17, name: 'Baby Bottle Set', price: '$25' },
    ],
    toys: [
        { id: 18, name: 'Action Figure', price: '$30' },
        { id: 19, name: 'Lego Set', price: '$50' },
        { id: 20, name: 'Toy Car', price: '$20' },
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
            {products.length > 0 ? (
                products.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))
            ) : (
                <p>No products available.</p>
            )}
        </div>
    );
};

const ProductComponent = () => {
    const [selectedCategory, setSelectedCategory] = useState("electronics");

    return (
        <div>
            <div className="categories">
                {Object.keys(productsData).map((category) => (
                    <button 
                        key={category} 
                        onClick={() => setSelectedCategory(category)}
                        className={selectedCategory === category ? "active-category" : ""}
                    >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                ))}
            </div>
            <ProductList category={selectedCategory} />
        </div>
    );
};

export default ProductComponent;
