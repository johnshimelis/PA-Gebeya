import React from "react";
import "../styles/women.css"; // Assuming styles are in a separate CSS file named Men.css
import m1 from "../images/assets/m-1.png";
import m2 from "../images/assets/m-2.png";
import m3 from "../images/assets/m-3.png";
import m4 from "../images/assets/m-4.png";
import m5 from "../images/assets/m-5.png";
import m6 from "../images/assets/m-6.png";
import m7 from "../images/assets/m-7.png";

const Men = () => {
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
          Men's fashion
        </h4>
        <div className="view-all-button">VIEW ALL</div>
      </div>
      <div className="nav-deals-main">
        <div className="nav-women-pic">
          <img src={m1} alt="Men's Fashion 1" />
        </div>
        <div className="nav-women-pic">
          <img src={m2} alt="Men's Fashion 2" />
        </div>
        <div className="nav-women-pic">
          <img src={m3} alt="Men's Fashion 3" />
        </div>
        <div className="nav-women-pic">
          <img src={m4} alt="Men's Fashion 4" />
        </div>
        <div className="nav-women-pic">
          <img src={m5} alt="Men's Fashion 5" />
        </div>
        <div className="nav-women-pic">
          <img src={m6} alt="Men's Fashion 6" />
        </div>
        <div className="nav-women-pic">
          <img src={m7} alt="Men's Fashion 7" />
        </div>
      </div>
    </section>
  );
};

export default Men;
