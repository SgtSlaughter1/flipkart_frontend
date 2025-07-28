import { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
} from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
} from "@mui/material";
import Search from "./Search";
import Login from "./Login";
import Signup from "./Signup";
import Navbar from "./Navbar";
import Profile from "./Profile";
import Carousel from "./Carousel";
import ChartJS from "chart.js/auto";
import Cart from "./Cart";
import Products from "./Products";

function RequireAuth({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function AppContent({ products }) {
  const location = useLocation();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [categories, setCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});

  // Category icons mapping
  const categoryIcons = {
    smartphones: { icon: "📱", color: "bg-blue-100" },
    "mens-shirts": { icon: "👗", color: "bg-pink-100" },
    laptops: { icon: "💻", color: "bg-purple-100" },
    "home-decoration": { icon: "🏠", color: "bg-green-100" },
    fragrances: { icon: "💄", color: "bg-yellow-100" },
    "sports-accessories": { icon: "⚽", color: "bg-orange-100" },
    books: { icon: "📚", color: "bg-indigo-100" },
    toys: { icon: "🧸", color: "bg-red-100" },
    // Default fallbacks
    default: { icon: "🛍️", color: "bg-gray-100" },
  };

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          "https://flipkart-backend4.onrender.com/categories"
        );
        const data = await response.json();
        setCategories(data.slice(0, 8));
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products for each category
  useEffect(() => {
    const fetchCategoryProducts = async () => {
      const productsByCategory = {};

      for (const category of categories) {
        try {
          const response = await fetch(
            `https://flipkart-backend4.onrender.com/products/category/${category}`
          );
          const data = await response.json();
          productsByCategory[category] = data.slice(0, 8); // Limit to 8 products per category
        } catch (error) {
          console.error(`Failed to fetch products for ${category}:`, error);
        }
      }

      setCategoryProducts(productsByCategory);
    };

    if (categories.length > 0) {
      fetchCategoryProducts();
    }
  }, [categories]);

  // Chart logic remains the same
  useEffect(() => {
    if (products.length && chartRef.current) {
      const prices = products.map((p) => p.price);
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      chartInstance.current = new ChartJS(chartRef.current, {
        type: "bar",
        data: {
          labels: prices.map((_, i) => `#${i + 1}`),
          datasets: [
            {
              label: "Price Distribution",
              data: prices,
              backgroundColor: "rgba(59, 130, 246, 0.5)",
              borderColor: "rgba(59, 130, 246, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: true, text: "Product Price Distribution" },
          },
          scales: {
            x: { title: { display: true, text: "Product" } },
            y: { title: { display: true, text: "Price ($)" } },
          },
        },
      });
    }
  }, [products]);

  return (
    <>
      {location.pathname !== "/login" && location.pathname !== "/signup" && (
        <Navbar />
      )}
      <Container sx={{ mt: 4 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/products" element={<Products />} />
          <Route path="/search" element={<Search />} />
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/"
            element={
              <div>
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 mb-8 rounded-lg">
                  <div className="max-w-6xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">
                      Welcome to Flipkart
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 opacity-90">
                      India's Biggest Online Store
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold">10M+</div>
                        <div className="text-sm opacity-80">Products</div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold">50M+</div>
                        <div className="text-sm opacity-80">
                          Happy Customers
                        </div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold">1000+</div>
                        <div className="text-sm opacity-80">Brands</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Carousel */}
                <Carousel />

                {/* Quick Categories */}
                <div className="mb-12">
                  <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
                    Shop by Category
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {categories.map((category, idx) => {
                      const categoryInfo =
                        categoryIcons[category] || categoryIcons.default;
                      return (
                        <Link
                          key={idx}
                          to={`/products?category=${category}`}
                          className={`${categoryInfo.color} rounded-xl p-6 text-center hover:scale-105 transition-transform cursor-pointer shadow-sm hover:shadow-md block`}
                        >
                          <div className="text-4xl mb-2">
                            {categoryInfo.icon}
                          </div>
                          <div className="font-semibold text-gray-800 text-sm">
                            {category.charAt(0).toUpperCase() +
                              category.slice(1).replace("-", " ")}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Featured Deals */}
                <div className="mb-12">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-8 text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2">
                      🔥 Today's Best Deals
                    </h2>
                    <p className="text-lg opacity-90">
                      Limited time offers - Don't miss out!
                    </p>
                  </div>
                </div>

                {/* Category-based product listing */}
                {Object.entries(categoryProducts).map(
                  ([category, products]) => (
                    <div key={category} className="mb-12">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">
                          {category.charAt(0).toUpperCase() +
                            category.slice(1).replace("-", " ")}
                        </h2>
                        <Link
                          to={`/products?category=${category}`}
                          className="text-blue-600 font-semibold hover:text-blue-800"
                        >
                          View All →
                        </Link>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product, idx) => (
                          <div
                            key={product._id || idx}
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 flex flex-col items-start border border-gray-100"
                          >
                            <div className="relative w-full mb-3">
                              <img
                                src={product.thumbnail}
                                alt={product.title}
                                className="w-full h-40 object-contain rounded"
                              />
                              {product.discountPercentage && (
                                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                                  {Math.round(product.discountPercentage)}% OFF
                                </div>
                              )}
                            </div>
                            <div className="font-semibold text-base mb-2 line-clamp-2 min-h-[48px]">
                              {product.title}
                            </div>
                            <div className="text-gray-600 text-sm mb-2 line-clamp-2 min-h-[32px]">
                              {product.description}
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-blue-600 font-bold text-lg">
                                ₹{product.price}
                              </span>
                              {product.discountPercentage && (
                                <span className="text-gray-400 line-through text-sm">
                                  ₹
                                  {Math.round(
                                    product.price /
                                      (1 - product.discountPercentage / 100)
                                  )}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between w-full mb-2">
                              <div className="flex items-center">
                                <span className="bg-green-600 text-white text-xs font-semibold px-2 py-0.5 rounded mr-2">
                                  {product.rating} ★
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                Stock: {product.stock}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mb-3">
                              Brand: {product.brand}
                            </div>
                            <div className="flex gap-2 mt-auto w-full">
                              <button
                                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                onClick={async () => {
                                  try {
                                    const response = await fetch(
                                      "https://flipkart-backend4.onrender.com/cart/add",
                                      {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                          productId: product._id,
                                          quantity: 1,
                                          userId: "1",
                                        }),
                                      }
                                    );

                                    const data = await response.json();
                                    if (data.success) {
                                      // Update cart count in navbar
                                      if (window.updateCartCount) {
                                        window.updateCartCount();
                                      }
                                      alert("Added to cart!");
                                    } else {
                                      throw new Error(
                                        data.message || "Failed to add to cart"
                                      );
                                    }
                                  } catch (error) {
                                    console.error("Add to cart error:", error);
                                    alert("Failed to add to cart");
                                  }
                                }}
                              >
                                Add to Cart
                              </button>
                              <button
                                className="flex-1 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                                onClick={async () => {
                                  try {
                                    const response = await fetch(
                                      "https://flipkart-backend4.onrender.com/cart/add",
                                      {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                          productId: product._id, // Use only _id for consistency
                                          quantity: 1,
                                          userId: "1", // Changed from 'user' to 'userId'
                                        }),
                                      }
                                    );

                                    const data = await response.json();
                                    if (data.success) {
                                      window.location.href = "/cart";
                                    } else {
                                      throw new Error(
                                        data.message || "Failed to add to cart"
                                      );
                                    }
                                  } catch (error) {
                                    console.error("Buy now error:", error);
                                    alert("Failed to add to cart");
                                  }
                                }}
                              >
                                Buy Now
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}

                {/* Newsletter Section */}
                <div className="bg-gray-100 rounded-lg p-8 text-center mb-8">
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">
                    Stay Updated with Latest Deals
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Subscribe to get notifications about new products and
                    exclusive offers
                  </p>
                  <div className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>
            }
          />
        </Routes>
      </Container>
    </>
  );
}

function App() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    fetch("https://flipkart-backend4.onrender.com/products")
      .then((res) => res.json())
      .then((data) => {
        // If data is an array of objects with products arrays, flatten them
        let allProducts = [];
        if (Array.isArray(data) && data.length > 0 && data[0].products) {
          data.forEach((doc) => {
            if (Array.isArray(doc.products)) {
              allProducts = allProducts.concat(doc.products);
            }
          });
        } else if (Array.isArray(data)) {
          allProducts = data;
        }
        setProducts(allProducts);
      });
  }, []);
  return (
    <Router>
      <AppContent products={products} />
    </Router>
  );
}

export default App;
