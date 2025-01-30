import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify"; // ✅ Import ToastContainer
import "react-toastify/dist/ReactToastify.css"; // ✅ Import Toastify CSS

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
import Cart from "./components/cart";  
import ProductDetails from "./components/ProductDetail";
import { CartProvider } from "./components/CartContext"; // ✅ Import CartProvider

function App() {
  return (
    <CartProvider>  
      <Router>
        <div className="App">
          <Header />
          <Navbar />
          
          {/* ✅ Add ToastContainer for notifications */}
          <ToastContainer position="top-center" autoClose={2000} />

          <Routes>
            {/* Product Pages */}
            <Route path="/products/:category" element={<ProductsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/cart" element={<Cart />} />

            {/* Product Detail Page */}
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
    </CartProvider>
  );
}

export default App;
