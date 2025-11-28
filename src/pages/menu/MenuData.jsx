import { useEffect, useState } from "react";
import { getAllProducts } from "../../api/productApi";

const MenuData = () => {
  const [menu, setMenu] = useState({});

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    const products = await getAllProducts();

    // Group items by category dynamically
    const grouped = products.reduce((acc, item) => {
      acc[item.category] = acc[item.category] || [];
      acc[item.category].push(item);
      return acc;
    }, {});

    setMenu(grouped);
  };

  return (
    <div>
      {Object.keys(menu).map((category) => (
        <div key={category}>
          <h2>{category}</h2>

          {menu[category].map((item) => (
            <p key={item._id}>
              {item.name} - ₹{item.price}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
};

export default MenuData;
