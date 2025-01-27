import React from 'react';
import coverImage from '../images/assets/cover-3.png';

const Banner2 = () => {
  return (
    <section style={{ width: '100%', height: 'auto', backgroundColor: '#ebebeb', padding: '5px' }}>
      <img src={coverImage} alt="Banner" className="w-100" />
    </section>
  );
};

export default Banner2;
