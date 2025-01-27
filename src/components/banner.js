import React from 'react';
import "../styles/style.css";
import bannerMain from '../images/assets/banner.jpg'; // Adjust the path as needed
import bannerResize from '../images/assets/free-delivery1.png'; // Adjust the path as needed

const Banner = () => {
    return (
        <>
            {/* BANNER 1 */}
            <section
                id="banner-main"
                style={{ width: '100%', height: 'auto' }}
            >
                <img src={bannerResize} alt="Banner Main" className="w-100" />
            </section>
            
            {/* BANNER 1 END */}
        </>
    );
};

export default Banner;
