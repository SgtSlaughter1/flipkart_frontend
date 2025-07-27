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

  // Category selection for homepage
  const featuredCategories = [
    { value: "smartphones", label: "Smartphones" },
    { value: "laptops", label: "Laptops" },
    { value: "fragrances", label: "Fragrances" },
    { value: "mens-shirts", label: "Mens Shirts" },
  ];

  // Group products by category for homepage
  const productsByCategory = {};
  featuredCategories.forEach((cat) => {
    productsByCategory[cat.value] = products
      .filter((item) => item.category === cat.value)
      .slice(0, 12);
  });

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
          <Route
            path="/"
            element={
              <RequireAuth>
                <div>
                  {/* Carousel at the top */}
                  <Carousel />
                  {/* Category-based product listing */}
                  {featuredCategories.map(
                    (cat) =>
                      productsByCategory[cat.value] &&
                      productsByCategory[cat.value].length > 0 && (
                        <div key={cat.value} className="mb-12">
                          <h2 className="text-2xl font-bold mb-6 text-gray-800">
                            {cat.label}
                          </h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {productsByCategory[cat.value].map(
                              (product, idx) => (
                                <div
                                  key={product.id || idx}
                                  className="bg-white rounded-lg shadow p-4 flex flex-col items-start"
                                >
                                  <img
                                    src={product.thumbnail}
                                    alt={product.title}
                                    className="w-full h-40 object-contain mb-3 rounded"
                                  />
                                  <div className="font-semibold text-base mb-1 line-clamp-2 min-h-[48px]">
                                    {product.title}
                                  </div>
                                  <div className="text-gray-600 text-sm mb-1 line-clamp-2 min-h-[32px]">
                                    {product.description}
                                  </div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-blue-600 font-bold text-lg">
                                      ₹{product.price}
                                    </span>
                                    {product.discountPercentage && (
                                      <span className="text-green-600 font-semibold text-xs">
                                        {product.discountPercentage}% off
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center mb-1">
                                    <span className="bg-green-600 text-white text-xs font-semibold px-2 py-0.5 rounded mr-2">
                                      {product.rating} ★
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      Stock: {product.stock}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-500 mb-1">
                                    Brand: {product.brand}
                                  </div>
                                  {/* Add to Cart and Buy Now Buttons */}
                                  <div className="flex gap-2 mt-2 w-full">
                                    <button
                                      className="flex-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                      onClick={() => {
                                        fetch(
                                          "https://flipkart-backend4.onrender.com/cart/add",
                                          {
                                            method: "POST",
                                            headers: {
                                              "Content-Type":
                                                "application/json",
                                            },
                                            body: JSON.stringify({
                                              ...product,
                                              productId: product.id,
                                              quantity: 1,
                                              user: 2, // Replace with actual user id if available
                                              id: product.id,
                                            }),
                                          }
                                        )
                                          .then((res) => res.json())
                                          .then((data) => {
                                            alert("Added to cart!");
                                          })
                                          .catch((err) => {
                                            alert("Failed to add to cart");
                                          });
                                      }}
                                    >
                                      Add to Cart
                                    </button>
                                    <button
                                      className="flex-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                      onClick={() => {
                                        // Buy Now: Add to cart, then navigate to cart
                                        fetch(
                                          "https://flipkart-backend4.onrender.com/cart/add",
                                          {
                                            method: "POST",
                                            headers: {
                                              "Content-Type":
                                                "application/json",
                                            },
                                            body: JSON.stringify({
                                              ...product,
                                              productId: product.id,
                                              quantity: 1,
                                              user: 2, // Replace with actual user id if available
                                              id: product.id,
                                            }),
                                          }
                                        )
                                          .then((res) => res.json())
                                          .then((data) => {
                                            window.location.href = "/cart";
                                          })
                                          .catch((err) => {
                                            alert("Failed to add to cart");
                                          });
                                      }}
                                    >
                                      Buy Now
                                    </button>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )
                  )}
                </div>
              </RequireAuth>
            }
          />
          <Route
            path="/search"
            element={
              <RequireAuth>
                <Search />
              </RequireAuth>
            }
          />
          <Route
            path="/cart"
            element={
              <RequireAuth>
                <Cart />
              </RequireAuth>
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
