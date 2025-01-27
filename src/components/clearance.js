import React from 'react';
import deal1 from '../images/assets/c-deal-1.avif';
import deal2 from '../images/assets/c-edeal-2.avif';
import deal3 from '../images/assets/c-deal-3.avif';
import deal4 from '../images/assets/c-deal-4.avif';
import deal5 from '../images/assets/c-deal-5.avif';
import expressImg from '../images/assets/express.svg';
import '../styles/clearance.css';

const Clearance = () => {
  const deals = [
    {
      imgSrc: deal1,
      text: "Apple iPhone 14 Pro Max 256GB Deep",
      price: "43990.00",
      originalPrice: "5099",
      discount: "13% off",
      rating: 4.5,
      expressImg: expressImg,
    },
    {
      imgSrc: deal3,
      text: "Apple iPhone 14 Pro Max 256GB Deep",
      price: "43990.00",
      originalPrice: "5099",
      discount: "13% off",
      rating: 4.5,
      expressImg: expressImg,
    },
    {
      imgSrc: deal2,
      text: "Apple iPhone 14 Pro Max 256GB Deep",
      price: "43990.00",
      originalPrice: "5099",
      discount: "13% off",
      rating: 4.5,
      expressImg: expressImg,
    },
    {
      imgSrc: deal4,
      text: "Apple iPhone 14 Pro Max 256GB Deep",
      price: "43990.00",
      originalPrice: "5099",
      discount: "13% off",
      rating: 4.5,
      expressImg: expressImg,
    },
    {
      imgSrc: deal5,
      text: "Apple iPhone 14 Pro Max 256GB Deep",
      price: "43990.00",
      originalPrice: "5099",
      discount: "13% off",
      rating: 4.5,
      expressImg: expressImg,
    },
  ];

  return (
    <section>
      <div className="nav-view-all d-flex justify-content-between align-items-center">
        <h4 style={{ margin: "20px 0 0 25px", fontWeight: "700", color: "#404553" }}>
          Clearance Deals
        </h4>
        <div className="view-all-button">VIEW ALL</div>
      </div>

      <div className="nav-deals-main">
        {deals.map((deal, index) => (
          <div className="nav-rec-cards" style={{ backgroundColor: "#fafafa" }} key={index}>
            <div className="card-img">
              <img src={deal.imgSrc} alt="" />
            </div>
            <div className="card-info">
              <div className="card-text">{deal.text}</div>
              <div className="card-price">
                <span style={{ fontSize: "10px", marginRight: "5px" }}>AED </span>
                <span style={{ fontSize: "18px", fontWeight: "700" }}>{deal.price}</span>
              </div>
              <div className="card-off">
                <span
                  style={{
                    textDecoration: "line-through solid black",
                    fontSize: "10px",
                    marginRight: "5px",
                  }}
                >
                  {deal.originalPrice}
                </span>
                <span style={{ fontWeight: "700", color: "green" }}>{deal.discount}</span>
              </div>
              <div className="card-footer d-flex justify-content-between align-items-center mt-lg-5">
                <div className="card-express">
                  <img src={deal.expressImg} alt="" />
                </div>
                <div className="card-ratting">
                  {deal.rating} <i className="fa-solid fa-star"></i>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Clearance;
