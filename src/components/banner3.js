import React from 'react';
import "../styles/style.css";
import banner3 from '../images/assets/cover-4.jpg'; // Adjust the path as needed


const Banner3 = () => {
    return (
      <section style={{ width: "100%", height: "auto", backgroundColor: "#ebebeb", padding: "5px" }}>
        <img src={banner3} alt="Banner" className="w-100" />
      </section>
    );
  };
  
  export default Banner3;
  