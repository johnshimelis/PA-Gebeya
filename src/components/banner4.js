import React from 'react';
import "../styles/style.css";
import banner4 from '../images/assets/cover-5.gif'; // Adjust the path as needed


const Banner4 = () => {
    return (
      <section style={{ width: "100%", height: "auto", backgroundColor: "#ebebeb", padding: "5px" }}>
        <img src={banner4} alt="Banner" className="w-100" />
      </section>
    );
  };
  
  export default Banner4;
  