import logo from './logo.svg';
import './App.css';
import Header from './components/header';
import Navbar from './components/navbar';
import Banner from './components/banner';
import Carousel from './components/carousel';
import RoundSlider from './components/slider';
import Deals from './components/deals';
import RecommendedDeals from './components/recommended';
import School from './components/school';
import Toy from './components/toy';
import Banner2 from './components/banner2';
import Carousel2 from './components/carousel2';
import NoonOnly from './components/noonOnly';
import Trending from './components/trending';
import Banner3 from './components/banner3';
import Clearance from './components/clearance';
import Banner4 from './components/banner4';
import BackToSchool from './components/backToSchool';
import Women from './components/women';
import Men from './components/men';
import Kid from './components/kid';
import Electronics from './components/electronics';
import Banner5 from './components/banner5';
import Furniture from './components/furniture';
import Banner6 from './components/banner6';
import Banner7 from './components/banner7';
import Footer from './components/footer';
import BestSeller from './components/BestSeller';
import Discount from './components/Discount';
function App() {
  return (
    <div className="App">
     <Header />
     <Navbar />
     <Carousel/>
    <RoundSlider />
    
    <RecommendedDeals />
    {/* <School />
    <Toy />
    <Banner2 /> */}
    <Carousel2 />
    <Discount />
    <Banner2 />
    <Trending />
    <Banner3 />
    <BestSeller />
  
    {/* <NoonOnly /> */}
    {/* <Trending />
    <Banner3 />
    <Clearance />
    <Banner4 />
    <BackToSchool />
    <Women />
    <Men />
    <Kid />
    <Electronics />
    <Banner5 />
    <Furniture />
    <Banner6 />
    <Banner7 /> */}

    <Footer />
    </div>
  );
}

export default App;
