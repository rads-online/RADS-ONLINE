import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { auth, db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function ProductGrid() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const allowedAdmins = [
          "sudharshanr2510@gmail.com",
          "contact.radsonline@gmail.com",
          "r983230@gmail.com"
        ];
        setIsAdmin(allowedAdmins.includes(user.email));
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsQuery = query(
          collection(db, "products"),
          where("status", "==", "approved")
        );
        const querySnapshot = await getDocs(productsQuery);
        const productsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsList);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF9900]"></div>
      </div>
    );
  }

  return (
    <section className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <p className="text-gray-600">Discover our handpicked selection of the best products</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {products.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-xl text-gray-600">No products available.</p>
              <p className="text-gray-500 mt-2">Check back later for new products!</p>
            </div>
          ) : (
            products.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                showActions={isAdmin}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
