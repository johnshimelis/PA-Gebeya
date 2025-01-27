import React from "react";
import "../styles/women.css"; // Assuming styles are in a separate CSS file named Furniture.css
import f1 from "../images/assets/f-1.png";
import f2 from "../images/assets/f-2.png";
import f3 from "../images/assets/f-3.png";
import f4 from "../images/assets/f-4.png";
import f5 from "../images/assets/f-5.png";
import f6 from "../images/assets/f-6.png";
import f7 from "../images/assets/f-7.png";

const Furniture = () => {
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
          Furniture
        </h4>
        <div className="view-all-button">VIEW ALL</div>
      </div>
      <div className="nav-deals-main">
        <div className="nav-women-pic">
          <img src={f1} alt="Furniture 1" />
        </div>
        <div className="nav-women-pic">
          <img src={f2} alt="Furniture 2" />
        </div>
        <div className="nav-women-pic">
          <img src={f3} alt="Furniture 3" />
        </div>
        <div className="nav-women-pic">
          <img src={f4} alt="Furniture 4" />
        </div>
        <div className="nav-women-pic">
          <img src={f5} alt="Furniture 5" />
        </div>
        <div className="nav-women-pic">
          <img src={f6} alt="Furniture 6" />
        </div>
        <div className="nav-women-pic">
          <img src={f7} alt="Furniture 7" />
        </div>
      </div>
    </section>
  );
};

export default Furniture;
