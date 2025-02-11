import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
import { CartProvider } from "./components/CartContext";
import { AuthProvider } from "./components/AuthContext";  // ✅ Import AuthProvider
import AuthPage from "./components/auth";
import Checkout from "./components/checkout";

function App() {
  return (
    <Router> {/* Router should be the top level here */}
      <AuthProvider> {/* AuthProvider is wrapped inside Router */}
        <CartProvider>  
          <div className="App">
            <Header />
            <Navbar />
            
            <ToastContainer position="top-center" autoClose={2000} />

            <Routes>
              <Route path="/products/:category" element={<ProductsPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/product_detail" element={<ProductDetails />} />
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
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
