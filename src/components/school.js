import React from 'react';
import "../styles/school.css";
import school1 from '../images/assets/school-1.png';
import school2 from '../images/assets/school-2.png';
import school3 from '../images/assets/school-3.png';
import school4 from '../images/assets/school-4.png';
import school5 from '../images/assets/school-5.png';
import school6 from '../images/assets/school-6.png';
import school7 from '../images/assets/school-7.png';
import school8 from '../images/assets/school-8.png';
import school9 from '../images/assets/school-9.png';
import school10 from '../images/assets/school-10.png';

const School = () => {
  return (
    <section style={{ backgroundColor: '#fffdea' }} id="school">
      <h3 style={{ margin: '10px 0px 10px 10px', fontWeight: 700, padding: '0%' }}>
        Be well prepared for School
      </h3>
      <div className="nav-school">
        <img src={school1} alt="School item 1" />
        <img src={school2} alt="School item 2" />
        <img src={school3} alt="School item 3" />
        <img src={school4} alt="School item 4" />
        <img src={school5} alt="School item 5" />
        <img src={school6} alt="School item 6" />
        <img src={school7} alt="School item 7" />
        <img src={school8} alt="School item 8" />
        <img src={school9} alt="School item 9" />
        <img src={school10} alt="School item 10" />
      </div>
    </section>
  );
};

export default School;
