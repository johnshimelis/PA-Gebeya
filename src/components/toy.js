import React from 'react';
import "../styles/toy.css";

import toy1 from '../images/assets/toy-1.avif';
import toy2 from '../images/assets/toy-2.avif';
import toy3 from '../images/assets/toy-3.avif';
import toy4 from '../images/assets/toy-4.avif';
import toy5 from '../images/assets/toy-5.avif';
import expressIcon from '../images/assets/express.svg';

const toys = [
  {
    image: toy1,
    text: 'Apple iPhone 14 Pro Max 256GB Deep',
    price: 43990.00,
    originalPrice: 5099,
    discount: 13,
    rating: 4.5
  },
  {
    image: toy2,
    text: 'Apple iPhone 14 Pro Max 256GB Deep',
    price: 43990.00,
    originalPrice: 5099,
    discount: 13,
    rating: 4.5
  },
  {
    image: toy3,
    text: 'Apple iPhone 14 Pro Max 256GB Deep',
    price: 43990.00,
    originalPrice: 5099,
    discount: 13,
    rating: 4.5
  },
  {
    image: toy4,
    text: 'Apple iPhone 14 Pro Max 256GB Deep',
    price: 43990.00,
    originalPrice: 5099,
    discount: 13,
    rating: 4.5
  },
  {
    image: toy5,
    text: 'Apple iPhone 14 Pro Max 256GB Deep',
    price: 43990.00,
    originalPrice: 5099,
    discount: 13,
    rating: 4.5
  }
];

const Toy = () => {
  return (
    <section>
      <h4 style={{ margin: '20px 0px 0px 25px', fontWeight: 700, padding: '0%' }}>
        Limited time toy deals
      </h4>
      <div className="nav-deals-main" style={{ padding: '10px' }}>
        {toys.map((toy, index) => (
          <div key={index} className="nav-rec-cards">
            <div className="card-img">
              <img src={toy.image} alt={`Toy ${index + 1}`} />
            </div>
            <div className="card-info">
              <div className="card-text">{toy.text}</div>
              <div className="card-price">
                <span style={{ fontSize: '10px', marginRight: '5px' }}>AED </span>
                <span style={{ fontSize: '18px', fontWeight: 700 }}>
                  {toy.price.toFixed(2)}
                </span>
              </div>
              <div className="card-off">
                <span
                  style={{
                    textDecoration: 'line-through solid black',
                    fontSize: '10px',
                    marginRight: '5px'
                  }}
                >
                  {toy.originalPrice}
                </span>
                <span style={{ fontWeight: 700, color: 'green' }}>
                  {toy.discount}% off
                </span>
              </div>
              <div className="card-footer d-flex justify-content-between align-items-center mt-lg-5">
                <div className="card-express">
                  <img src={expressIcon} alt="Express" />
                </div>
                <div className="card-ratting">
                  {toy.rating} <i className="fa-solid fa-star"></i>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Toy;
