import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/api/productApi";

import { getCategories } from "@/api/categoryApi";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    image: null,
  });

  const [editingId, setEditingId] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Sorting
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Pagination
  const ITEMS_PER_PAGE = 5;
  const [page, setPage] = useState(1);

  const loadProducts = async () => {
    const data = await getAllProducts();
    setProducts(data);
  };

  const loadCategories = async () => {
    const data = await getCategories();
    setCategoriesData(data);
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("category", form.category);
    
    if (form.image) formData.append("image", form.image);

    if (editingId) {
      await updateProduct(editingId, formData);
    } else {
      await createProduct(formData);
    }

    setForm({ name: "", price: "", category: "", image: null });
    setEditingId(null);
    loadProducts();
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      price: product.price,
      category: product.category,
      image: null,
    });
    setEditingId(product._id);
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this product?")) {
      await deleteProduct(id);
      loadProducts();
    }
  };

  const toggleAvailability = async (id) => {
    await updateProduct(id, { toggle: true });
    loadProducts();
  };

  // Export CSV
  const exportCSV = () => {
    const csvContent = [
      ["Name", "Price", "Category", "Status"],
      ...products.map((p) => [
        p.name,
        p.price,
        p.category,
        p.isAvailable ? "Available" : "Unavailable",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "products.csv");
  };

  // Export Excel
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(products);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, "products.xlsx");
  };

  // Filtering
  let filtered = products.filter((p) =>
    [p.name, p.category, p.price.toString()]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (categoryFilter !== "All") {
    filtered = filtered.filter((p) => p.category === categoryFilter);
  }

  // Sorting
  filtered.sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();

    if (sortOrder === "asc") return valA > valB ? 1 : -1;
    return valA < valB ? 1 : -1;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const changeSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-4">Products</h1>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-xl shadow mb-6 border"
      >
        <h2 className="text-lg font-semibold mb-3">
          {editingId ? "Edit Product" : "Add Product"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Name"
            className="border p-2 rounded-lg"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <input
            type="number"
            placeholder="Price"
            className="border p-2 rounded-lg"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />

          {/* Category Dropdown */}
          <select
            className="border p-2 rounded-lg"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
          >
            <option value="">Select Category</option>
            {categoriesData.map((cat) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          <input
            type="file"
            className="border p-2 rounded-lg"
            onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
          />
        </div>

        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          {editingId ? "Update" : "Add"}
        </button>
      </form>

      {/* FILTERS */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search products..."
          className="w-full sm:w-64 border p-2 rounded-lg"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <select
          className="border p-2 rounded-lg"
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="All">All</option>
          {categoriesData.map((cat) => (
            <option key={cat._id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* EXPORT BUTTONS */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          Export CSV
        </button>

        <button
          onClick={exportExcel}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg"
        >
          Export Excel
        </button>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="bg-white shadow rounded-xl border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>

            <th
                className="p-3 cursor-pointer"
                onClick={() => changeSort("image")}
              >
                Image{" "}
                {sortField === "alt" ? (sortOrder === "asc" ? "⬆" : "⬇") : ""}
              </th>

              <th
                className="p-3 cursor-pointer"
                onClick={() => changeSort("name")}
              >
                Name{" "}
                {sortField === "name" ? (sortOrder === "asc" ? "⬆" : "⬇") : ""}
              </th>

              <th
                className="p-3 cursor-pointer"
                onClick={() => changeSort("price")}
              >
                Price{" "}
                {sortField === "price" ? (sortOrder === "asc" ? "⬆" : "⬇") : ""}
              </th>

              <th
                className="p-3 cursor-pointer"
                onClick={() => changeSort("category")}
              >
                Category{" "}
                {sortField === "category"
                  ? sortOrder === "asc"
                    ? "⬆"
                    : "⬇"
                  : ""}
              </th>

              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((product) => (
              <tr key={product._id} className="border-t">
                   <td className="p-3">
                  {product.image ? (
                    <img
                      src={`http://localhost:5000${product.image}`}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  ) : (
                    <span className="text-gray-400">No Image</span>
                  )}
                </td>
                <td className="p-3">{product.name}</td>
                <td className="p-3">₹{product.price}</td>
                <td className="p-3">{product.category}</td>
             

                <td className="p-3 text-center space-x-2">
                  {/* Toggle Availability */}
                  <button
                    onClick={() => toggleAvailability(product._id)}
                    className={`px-3 py-1 rounded-lg ${
                      product.isAvailable ? "bg-green-500" : "bg-gray-400"
                    } text-white`}
                  >
                    {product.isAvailable ? "Available" : "Unavailable"}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => handleEdit(product)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded-lg"
                  >
                    Edit
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {paginated.length === 0 && (
              <tr>
                <td colSpan="4" className="p-3 text-center text-gray-500">
                  No matching products
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center mt-4 gap-2">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 rounded ${
              page === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </DashboardLayout>
  );
}
