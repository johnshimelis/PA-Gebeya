import React from "react";
import "../styles/women.css"; // Assuming styles are in a separate CSS file named Electronics.css
import e1 from "../images/assets/e-1.png";
import e2 from "../images/assets/e-2.png";
import e3 from "../images/assets/e-3.png";
import e4 from "../images/assets/e-4.png";
import e5 from "../images/assets/e-5.png";
import e6 from "../images/assets/e-6.png";
import e7 from "../images/assets/e-7.png";

const Electronics = () => {
  return (
    <section>
      <div className="nav-view-all d-flex justify-content-between align-items-center">
        <h4
          style={{
            margin: "20px 0px 0px 25px",
            fontWeight: 700,
            padding: 0,
            color: "#404553",
          }}
        >
          Electronics
        </h4>
        <div className="view-all-button">VIEW ALL</div>
      </div>
      <div className="nav-deals-main">
        <div className="nav-women-pic">
          <img src={e1} alt="Electronics 1" />
        </div>
        <div className="nav-women-pic">
          <img src={e2} alt="Electronics 2" />
        </div>
        <div className="nav-women-pic">
          <img src={e3} alt="Electronics 3" />
        </div>
        <div className="nav-women-pic">
          <img src={e4} alt="Electronics 4" />
        </div>
        <div className="nav-women-pic">
          <img src={e5} alt="Electronics 5" />
        </div>
        <div className="nav-women-pic">
          <img src={e6} alt="Electronics 6" />
        </div>
        <div className="nav-women-pic">
          <img src={e7} alt="Electronics 7" />
        </div>
      </div>
    </section>
  );
};

export default Electronics;
