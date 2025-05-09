import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { FaSpinner, FaCheck, FaTimes } from "react-icons/fa";

export default function AdminDashboard() {
  const [sellers, setSellers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("sellers");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch sellers
      const usersRef = collection(db, "users");
      const sellersQuery = query(usersRef, where("role", "==", "seller"));
      const sellersSnapshot = await getDocs(sellersQuery);
      const sellersList = sellersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSellers(sellersList);

      // Fetch products
      const productsRef = collection(db, "products");
      const productsQuery = query(productsRef, where("status", "==", "pending"));
      const productsSnapshot = await getDocs(productsQuery);
      const productsList = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsList);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSellerApproval = async (sellerId, approved) => {
    try {
      const sellerRef = doc(db, "users", sellerId);
      await updateDoc(sellerRef, {
        status: approved ? "approved" : "rejected"
      });
      fetchData();
    } catch (error) {
      console.error("Error updating seller status:", error);
    }
  };

  const handleProductApproval = async (productId, approved) => {
    try {
      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, {
        status: approved ? "approved" : "rejected"
      });
      fetchData();
    } catch (error) {
      console.error("Error updating product status:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-[#FF9900]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h2>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("sellers")}
          className={`px-4 py-2 rounded-md ${
            activeTab === "sellers"
              ? "bg-[#FF9900] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Pending Sellers
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`px-4 py-2 rounded-md ${
            activeTab === "products"
              ? "bg-[#FF9900] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Pending Products
        </button>
      </div>

      {/* Sellers List */}
      {activeTab === "sellers" && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brand Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Website
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sellers.map(seller => (
                <tr key={seller.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {seller.brandName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{seller.businessType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{seller.website}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      seller.status === "approved" ? "bg-green-100 text-green-800" :
                      seller.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {seller.status.charAt(0).toUpperCase() + seller.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {seller.status === "pending" && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSellerApproval(seller.id, true)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => handleSellerApproval(seller.id, false)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Products List */}
      {activeTab === "products" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="aspect-w-1 aspect-h-1 mb-4">
                <img
                  src={product.imageURL}
                  alt={product.title}
                  className="w-full h-48 object-contain"
                />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{product.title}</h3>
              <p className="text-gray-600 mb-2 line-clamp-2">{product.description}</p>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
                <span className="text-sm text-gray-500">Seller ID: {product.sellerId}</span>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleProductApproval(product.id, true)}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleProductApproval(product.id, false)}
                  className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 