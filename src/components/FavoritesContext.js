import React, { createContext, useContext, useState } from "react";

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favoriteItems, setFavoriteItems] = useState([]);

  // Add to favorites
  const addToFavorites = (item) => {
    setFavoriteItems((prevFavorites) => {
      if (!prevFavorites.some(favItem => favItem.uniqueId === item.uniqueId)) {
        return [...prevFavorites, item];
      }
      return prevFavorites;
    });
  };

  // Remove from favorites
  const removeFromFavorites = (itemId) => {
    setFavoriteItems((prevFavorites) =>
      prevFavorites.filter((favItem) => favItem.uniqueId !== itemId)
    );
  };

  return (
    <FavoritesContext.Provider value={{ favoriteItems, addToFavorites, removeFromFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};

// Custom hook for easy access
export const useFavorites = () => {
  return useContext(FavoritesContext);
};
