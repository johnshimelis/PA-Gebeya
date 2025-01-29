import React from "react";

const CartPage = () => {
    const cartProduct = JSON.parse(localStorage.getItem("cartProduct")) || null;

    return (
        <section>
            <h2>Shopping Cart</h2>
            {cartProduct ? (
                <div className="cart-item">
                    <img src={cartProduct.img} alt={cartProduct.title} />
                    <h3>{cartProduct.title}</h3>
                    <p>Price: AED {cartProduct.price}</p>
                    <p>Original Price: AED {cartProduct.originalPrice}</p>
                    <p>{cartProduct.discount}</p>
                </div>
            ) : (
                <p>Your cart is empty.</p>
            )}
        </section>
    );
};

export default CartPage;
