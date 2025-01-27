import React from 'react';
import '../styles/trending.css';
import recCard1 from '../images/assets/rec-card-1.avif';
import tr2 from '../images/assets/tr-2.avif';
import tr3 from '../images/assets/tr-3.avif';
import tr4 from '../images/assets/tr-4.avif';
import tr5 from '../images/assets/tr-5.avif';
import expressIcon from '../images/assets/express.svg';

const Trending = () => {
  const products = [
    { img: recCard1, name: 'Apple iPhone 14 Pro Max 256GB Deep', price: 43990.0, originalPrice: 5099, discount: '13%' },
    { img: tr2, name: 'Apple iPhone 14 Pro Max 256GB Deep', price: 43990.0, originalPrice: 5099, discount: '13%' },
    { img: tr3, name: 'Apple iPhone 14 Pro Max 256GB Deep', price: 43990.0, originalPrice: 5099, discount: '13%' },
    { img: tr4, name: 'Apple iPhone 14 Pro Max 256GB Deep', price: 43990.0, originalPrice: 5099, discount: '13%' },
    { img: tr5, name: 'Apple iPhone 14 Pro Max 256GB Deep', price: 43990.0, originalPrice: 5099, discount: '13%' },
  ];

  return (
    <section>
      <div className="nav-view-all d-flex justify-content-between align-items-center">
        <h4 style={{ margin: '20px 0 0 25px', fontWeight: 700, color: '#404553' }}>
          Trending deals in Electronics
        </h4>
        <div className="view-all-button">VIEW ALL</div>
      </div>

      <div className="nav-deals-main">
        {products.map((product, index) => (
          <div className="nav-rec-cards" key={index} style={{ backgroundColor: '#fafafa' }}>
            <div className="card-img">
              <img src={product.img} alt={`Product ${index + 1}`} />
            </div>
            <div className="card-info">
              <div className="card-text">{product.name}</div>
              <div className="card-price">
                <span style={{ fontSize: '10px', marginRight: '5px' }}>AED </span>
                <span style={{ fontSize: '18px', fontWeight: 700 }}>{product.price.toFixed(2)}</span>
              </div>
              <div className="card-off">
                <span
                  style={{
                    textDecoration: 'line-through solid black',
                    fontSize: '10px',
                    marginRight: '5px',
                  }}
                >
                  {product.originalPrice}
                </span>
                <span style={{ fontWeight: 700, color: 'green' }}> {product.discount} off</span>
              </div>
              <div className="card-footer d-flex justify-content-between align-items-center mt-lg-5">
                <div className="card-express">
                  <img src={expressIcon} alt="Express Delivery" />
                </div>
                <div className="card-rating">
                  4.5 <i className="fa-solid fa-star"></i>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Trending;
