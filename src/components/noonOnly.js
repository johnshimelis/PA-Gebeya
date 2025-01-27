import React from 'react';
import '../styles/noonOnly.css';
import noonHead from '../images/assets/noon-head.png';
import noon1 from '../images/assets/noon-1.png';
import noon2 from '../images/assets/noon-2.png';
import noon3 from '../images/assets/noon-3.png';
import noon4 from '../images/assets/noon-4.png';

const NoonOnly = () => {
  return (
    <section>
      <div className="nav-deals-noon">
        <div className="nav-noon-head">
          <img src={noonHead} alt="Noon Head" />
        </div>
        <div className="nav-rem-box">
          <div className="nav-noon-rem">
            <img src={noon1} alt="Deal 1" />
            <img src={noon2} alt="Deal 2" />
            <img src={noon3} alt="Deal 3" />
            <img src={noon4} alt="Deal 4" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default NoonOnly;
