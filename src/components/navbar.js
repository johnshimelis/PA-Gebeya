import React, { useState } from 'react';
import downIcon from '../images/assets/down.png';
import screenshotImage from '../images/assets/free-delivery1.png';

const Navbar = () => {
    const [category, setCategory] = useState('');

    const handleCategoryChange = (event) => {
        setCategory(event.target.value);
        console.log(`Selected Category: ${event.target.value}`);
    };

    return (
        <section>
            <div className="nav-second">
                <ul className="text-nav">
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
