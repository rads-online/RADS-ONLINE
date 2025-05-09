import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import ProductUploadModal from "./components/ProductUploadModal";
import ProductGrid from "./components/ProductGrid";

export default function AdminPage() {
  const [products, setProducts] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    const storedProducts = JSON.parse(localStorage.getItem("products")) || [];
    setProducts(storedProducts);
  }, []);

  const handleAddProduct = (product) => {
    const updated = [...products, product];
    setProducts(updated);
    localStorage.setItem("products", JSON.stringify(updated));
  };

  const handleDeleteProduct = (index) => {
    const updated = products.filter((_, i) => i !== index);
    setProducts(updated);
    localStorage.setItem("products", JSON.stringify(updated));
  };

  const handleEditClick = (index) => {
    setEditIndex(index);
    setShowUploadModal(true);
  };

  const handleEditProduct = (updatedProduct) => {
    const updated = [...products];
    updated[editIndex] = updatedProduct;
    setProducts(updated);
    localStorage.setItem("products", JSON.stringify(updated));
    setEditIndex(null);
  };

  return (
    <>
      <Navbar onUploadClick={() => setShowUploadModal(true)} />
      <ProductGrid
        products={products}
        onDeleteProduct={handleDeleteProduct}
        onEditClick={handleEditClick}
        showActions={true}
      />
      {showUploadModal && (
        <ProductUploadModal
          onClose={() => {
            setShowUploadModal(false);
            setEditIndex(null);
          }}
          onAddProduct={handleAddProduct}
          onEditProduct={handleEditProduct}
          product={editIndex !== null ? products[editIndex] : null}
        />
      )}
    </>
  );
}
