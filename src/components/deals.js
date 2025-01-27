import React from 'react';
import "../styles/deal.css";
// Images
import deal1 from '../images/assets/deal-1.png';
import deal2 from '../images/assets/deal-2.png';
import deal3 from '../images/assets/deal-3.png';
import deal4 from '../images/assets/deal-4.png';
import deal5 from '../images/assets/deal-5.jpg';
import deal6 from '../images/assets/deal-6.jpg';
import deal7 from '../images/assets/deal-7.jpg';
import deal8 from '../images/assets/deal-8.jpg';
import focus1 from '../images/assets/focus-1.png';
import focus2 from '../images/assets/focus-2.png';

const Deals = () => {
  return (
    <section>
      <div className="nav-deals-main" id="rec1">
        {/* Deals of the Day */}
        <div className="nav-deals">
          <div className="nav-deal-text">
            <h3>Deals of the Day</h3>
          </div>
          <div className="nav-deal-1">
            <img src={deal1} alt="deal 1" />
          </div>
          <div className="nav-deal-1">
            <img src={deal2} alt="deal 2" />
          </div>
          <div className="nav-deal-1">
            <img src={deal3} alt="deal 3" />
          </div>
          <div className="nav-deal-1">
            <img src={deal4} alt="deal 4" />
          </div>
        </div>

        {/* Mega Deals */}
        <div className="nav-deals">
          <div className="nav-deal-text justify-content-around d-flex m-0 p-0">
            <h3>Mega Deals</h3>
            <div className="timer">
              <i className="fa-solid fa-stopwatch me-lg-2"></i>16h : 40m
            </div>
            <div className="deal-button">
              ALL DEALS
            </div>
          </div>
          <div className="nav-deal-2">
            <div className="nav-deal-inner-1">
              <p className="sc" style={{ backgroundColor: 'rgb(244, 226, 12)', color: 'rgb(228, 41, 33)' }}>
                Eyewear & Eyewear Accessories deals
              </p>
              <img src={deal5} alt="deal 5" />
            </div>
            <div className="nav-deal-inner-2">
              <p>MADEYES Men's Fashion Sunglasses - Lens Size: 57 mm</p>
              <div className="d-flex mt-sm-1">
                <div className="price">
                  <p>195</p>
                </div>
                <div className="price-1">
                  <p>15 AED</p>
                </div>
              </div>
            </div>
          </div>
          <div className="nav-deal-2">
            <div className="nav-deal-inner-1">
              <p className="sc" style={{ backgroundColor: 'rgb(244, 226, 12)', color: 'rgb(228, 41, 33)' }}>
                Eyewear & Eyewear Accessories deals
              </p>
              <img src={deal6} alt="deal 6" />
            </div>
            <div className="nav-deal-inner-2">
              <p>MADEYES Men's Fashion Sunglasses - Lens Size: 57 mm</p>
              <div className="d-flex mt-sm-1">
                <div className="price">
                  <p>195</p>
                </div>
                <div className="price-1">
                  <p>15 AED</p>
                </div>
              </div>
            </div>
          </div>
          <div className="nav-deal-2">
            <div className="nav-deal-inner-1">
              <p className="sc" style={{ backgroundColor: 'rgb(244, 226, 12)', color: 'rgb(228, 41, 33)' }}>
                Eyewear & Eyewear Accessories deals
              </p>
              <img src={deal7} alt="deal 7" />
            </div>
            <div className="nav-deal-inner-2">
              <p>MADEYES Men's Fashion Sunglasses - Lens Size: 57 mm</p>
              <div className="d-flex mt-sm-1">
                <div className="price">
                  <p>195</p>
                </div>
                <div className="price-1">
                  <p>15 AED</p>
                </div>
              </div>
            </div>
          </div>
          <div className="nav-deal-2">
            <div className="nav-deal-inner-1">
              <p className="sc" style={{ backgroundColor: 'rgb(244, 226, 12)', color: 'rgb(228, 41, 33)' }}>
                Eyewear & Eyewear Accessories deals
              </p>
              <img src={deal8} alt="deal 8" />
            </div>
            <div className="nav-deal-inner-2">
              <p>MADEYES Men's Fashion Sunglasses - Lens Size: 57 mm</p>
              <div className="d-flex mt-sm-1">
                <div className="price">
                  <p>195</p>
                </div>
                <div className="price-1">
                  <p>15 AED</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* In Focus */}
        <div className="nav-deals">
          <div className="nav-deal-text">
            <h3>In Focus</h3>
          </div>
          <div className="nav-deal-1 w-100">
            <img src={focus1} alt="focus 1" />
          </div>
          <div className="nav-deal-1 w-100">
            <img src={focus2} alt="focus 2" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Deals;
