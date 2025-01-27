import React from "react";
import "../styles/women.css"; // Assuming styles are in a separate CSS file named Kid.css
import k1 from "../images/assets/k-1.png";
import k2 from "../images/assets/k-2.png";
import k3 from "../images/assets/k-3.png";
import k4 from "../images/assets/k-4.png";
import k5 from "../images/assets/k-5.png";
import k6 from "../images/assets/k-6.png";
import k7 from "../images/assets/k-7.png";

const Kid = () => {
  return (
    <section style={{ backgroundColor: "#dddddd", paddingBottom: "20px" }}>
      <div className="nav-view-all d-flex justify-content-between align-items-center">
        <h4
          style={{
            margin: "20px 0px 0px 25px",
            fontWeight: 700,
            padding: 0,
            color: "#404553",
          }}
        >
          Kid's fashion
        </h4>
        <div className="view-all-button">VIEW ALL</div>
      </div>
      <div className="nav-deals-main">
        <div className="nav-women-pic">
          <img src={k1} alt="Kid's Fashion 1" />
        </div>
        <div className="nav-women-pic">
          <img src={k2} alt="Kid's Fashion 2" />
        </div>
        <div className="nav-women-pic">
          <img src={k3} alt="Kid's Fashion 3" />
        </div>
        <div className="nav-women-pic">
          <img src={k4} alt="Kid's Fashion 4" />
        </div>
        <div className="nav-women-pic">
          <img src={k5} alt="Kid's Fashion 5" />
        </div>
        <div className="nav-women-pic">
          <img src={k6} alt="Kid's Fashion 6" />
        </div>
        <div className="nav-women-pic">
          <img src={k7} alt="Kid's Fashion 7" />
        </div>
      </div>
    </section>
  );
};

export default Kid;
