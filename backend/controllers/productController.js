import Product from "../models/Product.js";

// CREATE product
export const createProduct = async (req, res) => {
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";

    const product = await Product.create({
      name: req.body.name,
      price: req.body.price,
      category: req.body.category,
      image: imageUrl,
    });

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE product
export const updateProduct = async (req, res) => {
  try {
    // Toggle availability
    if (req.body.toggle) {
      const product = await Product.findById(req.params.id);
      product.isAvailable = !product.isAvailable;
      await product.save();
      return res.json(product);
    }

    const updateData = {
      name: req.body.name,
      price: req.body.price,
      category: req.body.category,
    };

    // If image uploaded
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE product
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted", product: deleted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
