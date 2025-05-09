import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import ProductGrid from "./components/ProductGrid";

export default function CustomerPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const storedProducts = JSON.parse(localStorage.getItem("products")) || [];
    setProducts(storedProducts);
  }, []);

  return (
    <>
      <Navbar />
      <ProductGrid
        products={products}
        showActions={false}
        onDeleteProduct={() => {}}
        onEditClick={() => {}}
      />
    </>
  );
}
