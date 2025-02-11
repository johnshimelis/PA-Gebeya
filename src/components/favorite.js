import React from "react";
import { useCart } from "./CartContext"; 
import { useFavorites } from "./FavoritesContext";  // ✅ Import useFavorites
import "../styles/favorite.css";  // Add necessary CSS for styling

const Favorites = () => {
  const { addToCart } = useCart();
  const { favoriteItems, removeFromFavorites } = useFavorites();  // ✅ Use global favorites state

  // Function to add an item to the cart and remove it from favorites
  const handleAddToCart = (item) => {
    addToCart(item);  
    removeFromFavorites(item.uniqueId);  // ✅ Remove from favorites after adding to cart
  };

  return (
    <div className="favorite-container">
      <div className="favorite-header">
        <h1>Your Favorites</h1>
        <p className="favorite-info">{favoriteItems.length} item(s) in your favorites</p>
      </div>

      {/* Flexbox container for favorite-content */}
      <div className="favorite-main">
        <div className="favorite-content">
          {/* If favorites are empty */}
          {favoriteItems.length === 0 && <p className="empty-favorites">Your favorites list is currently empty.</p>}

          {/* Render each product in a card format */}
          {favoriteItems.map((favoriteItem) => (
            <div key={favoriteItem.uniqueId} className="favorite-item">
              <img
                src={favoriteItem.img}
                alt={favoriteItem.title}
                className="favorite-item-image"
              />
              <div className="favorite-item-details">
                <div className="favorite-item-header">
                  <div>
                    <h2>{favoriteItem.title}</h2>
                    <p className="favorite-quantity">
                      <strong>The Price:</strong> ${Number(favoriteItem.price).toFixed(2)}
                    </p>
                  </div>
                  <button
                    className="delete-icon"
                    onClick={() => removeFromFavorites(favoriteItem.uniqueId)}  // ✅ Remove from favorites
                  >
                    🗑️
                  </button>
                </div>

                {/* Bottom Section: Add to Cart button */}
                <div className="favorite-bottom-section">
                  <button
                    className="add-to-cart-button"
                    onClick={() => handleAddToCart(favoriteItem)}
                  >
                    <span>Add to Cart</span> 🛒
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Favorites;
