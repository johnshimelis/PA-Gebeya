import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/style.css";

const Banner3 = () => {
  const [banner1, setBanner1] = useState(null);

  useEffect(() => {
    const fetchBanner1 = async () => {
      try {
        const response = await axios.get("https://pa-gebeya-backend.onrender.com/api/ads/banner1");
        if (response.data.length > 0) {
          setBanner1(response.data[0].images[0]); // Use the first image URL directly
        }
      } catch (error) {
        console.error("Error fetching banner1:", error);
      }
    };

    fetchBanner1();
  }, []);

  return (
    <section style={{ width: "100%", height: "auto", backgroundColor: "#ebebeb", padding: "5px" }}>
      {banner1 ? (
        <img src={banner1} alt="Banner" className="w-100" /> // Use the full URL directly
      ) : (
        <p>Loading banner...</p>
      )}
    </section>
  );
};

export default Banner3;