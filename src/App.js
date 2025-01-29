import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import Header from './components/header';
import Navbar from './components/navbar';
import Carousel from './components/carousel';
import RoundSlider from './components/slider';
import RecommendedDeals from './components/recommended';
import Carousel2 from './components/carousel2';
import Discount from './components/Discount';
import Trending from './components/trending';
import Banner3 from './components/banner3';
import BestSeller from './components/BestSeller';
import Footer from './components/footer';
import ProductsPage from "./components/ProductsPage";
import Cart from "./components/cart";  // Import the Cart component
import ProductDetails from "./components/ProductDetail";

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Navbar />

        <Routes>
          {/* Product Page */}
          <Route path="/products/:category" element={<ProductsPage />} />
          <Route path="/products" element={<ProductsPage />} />

          {/* Cart Page */}
          <Route path="/product_detail" element={<ProductDetails />} />

          {/* Home Page */}
          <Route path="/" element={
            <>
              <Carousel />
              <RoundSlider />
              <RecommendedDeals />
              <Carousel2 />
              <Discount />
              <Trending />
              <Banner3 />
              <BestSeller />
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
