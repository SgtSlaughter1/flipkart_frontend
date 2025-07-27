import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://flipkart-backend4.onrender.com/products"
        );
        const data = await response.json();

        // Flatten products array
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

        // Filter by category if specified
        const filteredProducts = category
          ? allProducts.filter((product) => product.category === category)
          : allProducts;

        setProducts(filteredProducts);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  const handleAddToCart = async (product) => {
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
            userId: "1", // Changed from 'user' to 'userId'
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        if (window.updateCartCount) {
          window.updateCartCount();
        }
        alert("Added to cart!");
      } else {
        throw new Error(data.message || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      alert("Failed to add to cart");
    }
  };

  const handleBuyNow = async (product) => {
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
            userId: "1", // Changed from 'user' to 'userId'
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        window.location.href = "/cart";
      } else {
        throw new Error(data.message || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Buy now error:", error);
      alert("Failed to add to cart");
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading products...</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {category
            ? `${category.charAt(0).toUpperCase() + category.slice(1)} Products`
            : "All Products"}
        </h1>
        <p className="text-gray-600 mt-2">{products.length} products found</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 flex flex-col border border-gray-100"
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
                    product.price / (1 - product.discountPercentage / 100)
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
                onClick={() => handleAddToCart(product)}
              >
                Add to Cart
              </button>
              <button
                className="flex-1 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                onClick={() => handleBuyNow(product)}
              >
                Buy Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No products found</div>
        </div>
      )}
    </div>
  );
}

export default Products;
