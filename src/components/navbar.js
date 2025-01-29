import React, { useRef, useState, useEffect } from 'react';
import '../styles/nav.css';
import { FaChevronLeft, FaChevronRight, FaBars, FaTimes } from 'react-icons/fa';
import screenshotImage from '../images/assets/free-delivery1.png';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);
    const scrollContainerRef = useRef(null);

    const toggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    const scrollLeft = () => {
        scrollContainerRef.current.scrollBy({
            left: -200,
            behavior: 'smooth',
        });
    };

    const scrollRight = () => {
        scrollContainerRef.current.scrollBy({
            left: 200,
            behavior: 'smooth',
        });
    };

    useEffect(() => {
        const handleScroll = () => {
            const container = scrollContainerRef.current;
            if (!container) return;

            const isAtStart = container.scrollLeft === 0;
            const isAtEnd =
                container.scrollLeft + container.clientWidth >= container.scrollWidth;

            setShowLeftArrow(!isAtStart);
            setShowRightArrow(!isAtEnd);
        };

        const container = scrollContainerRef.current;
        if (container) {
            handleScroll();
            container.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (container) container.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <section>
            <div className={`nav-second ${isMenuOpen ? 'open' : ''}`}>
                {showLeftArrow && (
                    <button className="scroll-btn left" onClick={scrollLeft}>
                        <FaChevronLeft />
                    </button>
                )}

                <div className="scrollable-wrapper">
                    <ul ref={scrollContainerRef}>
                        <li>ELECTRONICS</li>
                        <li>MEN</li>
                        <li>WOMEN</li>
                        <li>HOME</li>
                        <li>BEAUTY & FRAGRANCE</li>
                        <li>BABY</li>
                        <li>TOYS</li>
                        <li>SPORTS</li>
                        <li>BESTSELLERS</li>
                        <li>BEAUTY & FRAGRANCE</li>
                        <li>BABY</li>
                        <li>TOYS</li>
                        <li>SPORTS</li>
                        <li>BESTSELLERS</li>
                        <li>BEAUTY & FRAGRANCE</li>
                        <li>BABY</li>
                        <li>TOYS</li>
                        <li>SPORTS</li>
                        <li>BESTSELLERS</li>
                    </ul>
                </div>

                {showRightArrow && (
                    <button className="scroll-btn right" onClick={scrollRight}>
                        <FaChevronRight />
                    </button>
                )}

                <div className="hamburger-menu">
                    <button onClick={toggleMenu}>
                        {isMenuOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>

                <div className="fixed-img">
                    <img src={screenshotImage} alt="Screenshot" className="nav-img-li" />
                </div>
            </div>
        </section>
    );
};

export default Navbar;
