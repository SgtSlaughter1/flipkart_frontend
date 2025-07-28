import { useState, useEffect } from "react";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = "1";

  const deliveryAddress = {
    location: "Sample address",
  };

  useEffect(() => {
    async function fetchCartAndProducts() {
      setLoading(true);
      setError(null);
      try {
        // First, get all carts and find all user's active carts and combine items
        const cartRes = await fetch(
          "https://flipkart-backend4.onrender.com/carts"
        );
        const cartData = await cartRes.json();

        if (!cartData.success) {
          setCartItems([]);
          return;
        }

        // Find all user's active carts and combine items
        const userCarts = cartData.data.filter(
          (cart) => cart.userId === userId && cart.status === "active"
        );

        if (!userCarts.length) {
          setCartItems([]);
          return;
        }

        let allCartItems = [];
        userCarts.forEach((cart) => {
          if (cart.items && cart.items.length) {
            allCartItems = allCartItems.concat(cart.items);
          }
        });

        if (!allCartItems.length) {
          setCartItems([]);
          return;
        }

        // Fetch all products to get product details
        const productsRes = await fetch(
          "https://flipkart-backend4.onrender.com/products"
        );
        const productsData = await productsRes.json();

        // Flatten products array
        let allProducts = [];
        if (
          Array.isArray(productsData) &&
          productsData.length > 0 &&
          productsData[0].products
        ) {
          productsData.forEach((doc) => {
            if (Array.isArray(doc.products)) {
              allProducts = allProducts.concat(doc.products);
            }
          });
        } else if (Array.isArray(productsData)) {
          allProducts = productsData;
        }

        // Combine cart items with product details
        const cartItemsWithDetails = allCartItems
          .map((cartItem) => {
            const product = allProducts.find(
              (p) => p._id?.toString() === cartItem.productId?.toString()
            );

            if (!product) {
              console.warn(
                "Product not found for cart item:",
                cartItem.productId
              );
            }

            return product
              ? {
                  ...product,
                  quantity: cartItem.quantity,
                  productId: cartItem.productId, // keep original productId
                }
              : null;
          })
          .filter(Boolean);
        // Filter out items where product wasn't found

        setCartItems(cartItemsWithDetails);
      } catch (err) {
        console.error("Cart fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCartAndProducts();
  }, []);

  const handleQuantity = async (idx, delta) => {
    const item = cartItems[idx];
    const newQuantity = (item.quantity || 1) + delta;

    if (newQuantity <= 0) {
      handleRemove(idx);
      return;
    }

    try {
      const response = await fetch(
        "https://flipkart-backend4.onrender.com/cart/add",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: item.productId || item._id,
            quantity: delta, // Add the delta, not the total quantity
            userId: userId, // Changed from 'user' to 'userId'
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        const items = [...cartItems];
        items[idx].quantity = newQuantity;
        setCartItems(items);
      }
    } catch (error) {
      console.error("Update quantity error:", error);
    }
  };

  const handleRemove = async (idx) => {
    const item = cartItems[idx];

    try {
      const response = await fetch(
        `https://flipkart-backend4.onrender.com/cart/${userId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: item.productId || item._id,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        const items = [...cartItems];
        items.splice(idx, 1);
        setCartItems(items);
      }
    } catch (error) {
      console.error("Remove item error:", error);
    }
  };

  // Pricing logic
  const price = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );
  const discount = cartItems.reduce((sum, item) => {
    const originalPrice =
      item.price / (1 - (item.discountPercentage || 0) / 100);
    return sum + (originalPrice - item.price) * (item.quantity || 1);
  }, 0);
  const platformFee = 4;
  const total = price + platformFee;

  if (loading) return <div className="p-8 text-center">Loading cart...</div>;
  if (error)
    return <div className="p-8 text-center text-red-600">Error: {error}</div>;

  return (
    <div className="bg-white min-h-screen py-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <div className="bg-white rounded shadow p-4 mb-4 flex items-center justify-between">
            <div>
              <span>
                Deliver to:{" "}
                <span className="font-bold text-blue-900">
                  {deliveryAddress.location}
                </span>
              </span>
            </div>
            <button className="border border-blue-500 text-blue-500 px-4 py-1 rounded hover:bg-blue-50">
              Change
            </button>
          </div>

          {cartItems.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              Your cart is empty.
            </div>
          )}

          {cartItems.map((item, idx) => (
            <div
              key={item.productId || item._id || idx}
              className="bg-white rounded shadow p-6 mb-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4 flex-1">
                <img
                  src={item.thumbnail}
                  alt={item.title || "Product"}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">
                    {item.title || "Unknown Product"}
                  </h3>
                  <p className="text-green-600 font-bold text-lg">
                    ₹{item.price || "--"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuantity(idx, -1)}
                    className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{item.quantity || 1}</span>
                  <button
                    onClick={() => handleQuantity(idx, 1)}
                    className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>

                <div className="text-lg font-bold">
                  ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                </div>

                <button
                  onClick={() => handleRemove(idx)}
                  className="text-red-500 hover:text-red-700 ml-4"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full md:w-80">
          <div className="bg-white rounded shadow p-4 mb-4">
            <div className="font-semibold text-lg mb-4">PRICE DETAILS</div>
            <div className="flex justify-between mb-2 text-sm">
              <span>
                Price ({cartItems.length} item
                {cartItems.length !== 1 ? "s" : ""})
              </span>
              <span>₹{Math.round(price)}</span>
            </div>
            <div className="flex justify-between mb-2 text-sm">
              <span>Discount</span>
              <span className="text-green-600">- ₹{Math.round(discount)}</span>
            </div>
            <div className="flex justify-between mb-2 text-sm">
              <span>Platform Fee</span>
              <span>₹{platformFee}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between mb-2 font-bold text-base">
              <span>Total Amount</span>
              <span>₹{Math.round(total)}</span>
            </div>
            <div className="text-green-700 text-sm mt-2">
              You will save ₹{Math.round(discount)} on this order
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
