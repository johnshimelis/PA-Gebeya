import React, { useState } from 'react';
import downIcon from '../images/assets/down.png';
import screenshotImage from '../images/assets/free-delivery1.png';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false); // Track menu state

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen); // Toggle menu visibility
    };

    return (
        <section>
            <div className={`nav-second ${isMenuOpen ? 'open' : ''}`}>
                {/* Hamburger icon */}
                <div className="hamburger-menu">
                    <button onClick={toggleMenu} aria-label="Toggle menu">
                        {/* Hamburger Icon */}
                        {!isMenuOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                    </button>
                </div>

                <ul>
                    <li>
                        <form className="text-nav">
                            <label htmlFor="categories">ALL CATEGORIES</label>
                            <img src={downIcon} alt="Dropdown Icon" className="ms-lg-4" />
                        </form>
                    </li>
                    <li>ELECTRONICS</li>
                    <li>MEN</li>
                    <li>WOMEN</li>
                    <li>HOME</li>
                    <li>BEAUTY & FRAGRANCE</li>
                    <li>BABY</li>
                    <li>TOYS</li>
                    <li>SPORTS</li>
                    <li>BESTSELLERS</li>
                    <li>
                        <img
                            src={screenshotImage}
                            alt="Screenshot"
                            className="nav-img-li #banner color"
                        />
                    </li>
                </ul>
            </div>
        </section>
    );
};

export default Navbar;
