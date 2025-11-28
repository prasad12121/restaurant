import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";

import { createOrder,addItemsToOrder } from "@/api/orderApi";
import { getAllProducts } from "@/api/productApi";

/* --------------------------------------------
   Highlight Search Text
-------------------------------------------- */
const highlightText = (text, query) => {
  if (!query) return text;

  const regex = new RegExp(`(${query})`, "gi");
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: text.replace(regex, `<mark class="bg-yellow-300">$1</mark>`),
      }}
    />
  );
};

const TakeOrder = () => {
  const { tableId,tableNumber } = useParams();

  /* STATES */
  const [menu, setMenu] = useState({});
  const [category, setCategory] = useState("");
  const [cart, setCart] = useState([]); // Only new items
  const [selectedItem, setSelectedItem] = useState(null);
  const [qty, setQty] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [existingOrder, setExistingOrder] = useState(null); // check

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const waiterId = user._id;

  /* --------------------------------------------
     Load Menu
  -------------------------------------------- */
  useEffect(() => {
    const fetchMenu = async () => {
      const products = await getAllProducts();

      const availableProducts =products.filter((p)=>p.isAvailable === true);

      const grouped = availableProducts.reduce((acc, item) => {
        acc[item.category] = acc[item.category] || [];
        acc[item.category].push(item);
        return acc;
      }, {});

      setMenu(grouped);
      const firstCat = Object.keys(grouped)[0];
      if (firstCat) setCategory(firstCat);
    };

    fetchMenu();
  }, []);

  /* Search Debounce */
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  /* All items for search */
  const allItems = Object.values(menu).flat();

  const filteredItems =
    debouncedSearch.trim() === ""
      ? menu[category] || []
      : allItems.filter((item) =>
          item.name.toLowerCase().includes(debouncedSearch.toLowerCase())
        );

  /* Suggestions */
  const suggestions =
    debouncedSearch.trim() === ""
      ? []
      : allItems
          .filter((item) =>
            item.name.toLowerCase().includes(debouncedSearch.toLowerCase())
          )
          .slice(0, 5);

  /* --------------------------------------------
     Add Item to Cart (Only NEW ITEMS)
  -------------------------------------------- */
  const addToCart = () => {
    if (!selectedItem) return;

    const newItem = {
      ...selectedItem,
      qty,
      total: selectedItem.price * qty,
    };

    setCart((prev) => [...prev, newItem]);
    setSelectedItem(null);
    setQty(1);
  };

  /* --------------------------------------------
     Submit KOT — SEND ONLY NEW ITEMS
  -------------------------------------------- */
  const handleKotSubmit = async () => {
    if (!cart.length) return alert("Add items first");

    const latestItems = [...cart]; // only send latest items

    const subtotal = cart.reduce((sum, item) => sum + (item.total || 0), 0);
    const gst = subtotal * 0.05;
    const grandTotal = subtotal + gst;

    const orderData = {
      tableNumber: parseInt(tableId),
      items: cart, // Only new items
      waiter: waiterId,
      subtotal,
      gst,
      grandTotal,
    };

    try {
      if (existingOrder) {
        // check
        const updatedOrder = await addItemsToOrder(
          existingOrder._id,
          latestItems,
          waiterId
        );
        setExistingOrder(updatedOrder);
      } else {
        await createOrder(orderData);
        alert(`Items sent to Kitchen for Table ${tableId}`);
        setCart([]); // Clear after KOT
      }
    } catch (err) {
      console.error(err);
      alert("Failed to send order");
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-4">Take Order</h1>

      {/* TABLE INFO */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-4">
        <p className="text-lg font-medium text-blue-700">
          Taking Order For: <b>Table No{tableNumber} Id:{tableId}</b>
        </p>
      </div>

      {/* CATEGORY TABS */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Object.keys(menu).map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setCategory(cat);
              setSearchTerm("");
            }}
            className={`px-4 py-2 rounded-full text-sm font-semibold 
              ${category === cat ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* SEARCH BAR */}
      <div className="relative mt-3">
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowSuggestions(true);
          }}
          className="w-full p-3 border rounded-xl"
        />

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute mt-1 bg-white border rounded-xl shadow-lg z-50">
            {suggestions.map((item) => (
              <div
                key={item._id}
                onClick={() => {
                  setSearchTerm(item.name);
                  setDebouncedSearch(item.name);
                  setShowSuggestions(false);
                }}
                className="p-2 hover:bg-gray-100 cursor-pointer"
              >
                {highlightText(item.name, debouncedSearch)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MENU ITEMS */}
      <div className="mt-4 grid gap-3">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item._id}
              className="p-3 border rounded-xl flex justify-between items-center bg-white shadow-sm"
            >
              <div>
                <p className="font-medium">
                  {highlightText(item.name, debouncedSearch)}
                </p>
                <p className="text-sm text-gray-600">₹{item.price}</p>
              </div>

              <button
                onClick={() => setSelectedItem(item)}
                className="px-4 py-1 bg-blue-600 text-white rounded-lg"
              >
                Add
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">No items found</p>
        )}
      </div>

      {/* SELECT ITEM MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl w-full sm:w-96 shadow-xl">
            <h2 className="text-xl font-semibold mb-2">{selectedItem.name}</h2>
            <p className="text-gray-600 mb-4">₹{selectedItem.price}</p>

            {/* QUANTITY */}
            <div className="flex items-center gap-3 mb-4">
              <button
                className="w-8 h-8 bg-gray-200 rounded"
                onClick={() => setQty((prev) => Math.max(1, prev - 1))}
              >
                -
              </button>
              <span className="text-lg font-bold">{qty}</span>
              <button
                className="w-8 h-8 bg-gray-200 rounded"
                onClick={() => setQty((prev) => prev + 1)}
              >
                +
              </button>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                className="flex-1 bg-gray-300 py-2 rounded-lg"
                onClick={() => setSelectedItem(null)}
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg"
                onClick={addToCart}
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER SUMMARY */}
      {cart.length > 0 &&
        (() => {
          const subtotal = cart.reduce(
            (sum, item) => sum + (item.total || 0),
            0
          );
          const gst = subtotal * 0.05;
          const grandTotal = subtotal + gst;

          return (
            <div className="mt-6 p-4 border rounded-xl bg-gray-50 shadow-sm">
              <h2 className="text-xl font-semibold mb-3">Order Summary</h2>

              <div className="space-y-3">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="font-medium text-sm">{item.name}</span>

                    <div className="flex items-center gap-2">
                      <button
                        className="w-7 h-7 bg-gray-200 rounded"
                        onClick={() =>
                          setCart((prev) =>
                            prev.map((e, i) =>
                              i === idx
                                ? {
                                    ...e,
                                    qty: Math.max(1, e.qty - 1),
                                    total: e.price * Math.max(1, e.qty - 1),
                                  }
                                : e
                            )
                          )
                        }
                      >
                        -
                      </button>

                      <span>{item.qty}</span>

                      <button
                        className="w-7 h-7 bg-gray-200 rounded"
                        onClick={() =>
                          setCart((prev) =>
                            prev.map((e, i) =>
                              i === idx
                                ? {
                                    ...e,
                                    qty: e.qty + 1,
                                    total: e.price * (e.qty + 1),
                                  }
                                : e
                            )
                          )
                        }
                      >
                        +
                      </button>
                    </div>

                    <span className="font-semibold">₹{item.total}</span>

                    <button
                      className="text-red-500 ml-2"
                      onClick={() =>
                        setCart((prev) => prev.filter((_, i) => i !== idx))
                      }
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-4 text-sm">
                <span>Subtotal:</span> <span>₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm mt-1">
                <span>GST (5%):</span> <span>₹{gst.toFixed(2)}</span>
              </div>

              <div className="flex justify-between font-bold text-lg mt-3 border-t pt-3">
                <span>Grand Total:</span> <span>₹{grandTotal.toFixed(2)}</span>
              </div>

              <button
                className="w-full mt-4 bg-green-600 text-white py-3 rounded-xl font-bold text-lg"
                onClick={handleKotSubmit}
              >
                Send to Kitchen (KOT)
              </button>
            </div>
          );
        })()}
    </DashboardLayout>
  );
};

export default TakeOrder;
