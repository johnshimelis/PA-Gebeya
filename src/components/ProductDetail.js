import { useLocation } from "react-router-dom";
import "../styles/ProductDetails.css"; // Add custom styles

const ProductDetails = () => {
  const location = useLocation();
  const product = location.state?.product || {};

  return (
    <div className="product-details">
      <div className="left-section">
        <div className="main-image-container">
          <img className="main-image" src={product.img} alt={product.title} />
          <img className="small-image" src={product.img} alt="Thumbnail" />
        </div>
        <div className="thumbnail-container">
          {product.images?.map((img, index) => (
            <img key={index} className="thumbnail" src={img} alt={`Thumbnail ${index}`} />
          ))}
        </div>
      </div>

      <div className="right-section">
        <h1 className="product-title">{product.title}</h1>
        <div className="info-section">
          <div className="price-counter-row">
            <p className="price">{product.price} AED</p>
            <div className="quantity-selector">
              <button>-</button>
              <span>1</span>
              <button>+</button>
            </div>
          </div>
          <div className="button-row">
            <button className="add-to-cart">🛒 Add to Cart</button>
            <button className="favorite">❤️</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
