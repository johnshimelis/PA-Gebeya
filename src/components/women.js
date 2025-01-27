import React from "react";
import "../styles/women.css"; // Assuming styles are in a separate CSS file named Women.css
import w1 from "../images/assets/w-1.png";
import w2 from "../images/assets/w-2.png";
import w3 from "../images/assets/w-3.png";
import w4 from "../images/assets/w-4.png";
import w5 from "../images/assets/w-5.png";
import w6 from "../images/assets/w-6.png";
import w7 from "../images/assets/w-7.png";

const Women = () => {
  return (
    <section style={{ backgroundColor: "#dddddd" }}>
      <div className="nav-view-all d-flex justify-content-between align-items-center">
        <h4
          style={{
            margin: "20px 0px 0px 25px",
            fontWeight: 700,
            padding: 0,
            color: "#404553",
          }}
        >
          Women's fashion
        </h4>
        <div className="view-all-button">VIEW ALL</div>
      </div>
      <div className="nav-rem-box">
        <div className="nav-deals-main">
          <div className="nav-women-pic">
            <img src={w1} alt="Women's Fashion 1" />
          </div>
          <div className="nav-women-pic">
            <img src={w2} alt="Women's Fashion 2" />
          </div>
          <div className="nav-women-pic">
            <img src={w3} alt="Women's Fashion 3" />
          </div>
          <div className="nav-women-pic">
            <img src={w4} alt="Women's Fashion 4" />
          </div>
          <div className="nav-women-pic">
            <img src={w5} alt="Women's Fashion 5" />
          </div>
          <div className="nav-women-pic">
            <img src={w6} alt="Women's Fashion 6" />
          </div>
          <div className="nav-women-pic">
            <img src={w7} alt="Women's Fashion 7" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Women;
