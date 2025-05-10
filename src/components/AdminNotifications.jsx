import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, updateDoc, doc, addDoc, deleteDoc, getDoc } from 'firebase/firestore';

const AdminNotifications = () => {
  const [sellerRequests, setSellerRequests] = useState([]);
  const [productRequests, setProductRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('sellers');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');

    try {
      // Listen for seller requests
      const sellerRequestsQuery = query(
        collection(db, 'sellerRequests'),
        where('status', '==', 'pending')
      );

      const sellerUnsubscribe = onSnapshot(sellerRequestsQuery, 
        (snapshot) => {
          const requests = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setSellerRequests(requests);
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching seller requests:', error);
          setError('Error loading seller requests');
          setLoading(false);
        }
      );

      // Listen for product requests
      const productRequestsQuery = query(
        collection(db, 'productRequests'),
        where('status', '==', 'pending')
      );

      const productUnsubscribe = onSnapshot(productRequestsQuery, 
        (snapshot) => {
          const requests = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setProductRequests(requests);
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching product requests:', error);
          setError('Error loading product requests');
          setLoading(false);
        }
      );

      return () => {
        sellerUnsubscribe();
        productUnsubscribe();
      };
    } catch (err) {
      console.error('Error setting up listeners:', err);
      setError('Error initializing notifications');
      setLoading(false);
    }
  }, []);

  const handleSellerRequest = async (requestId, action) => {
    try {
      setLoading(true);
      const requestRef = doc(db, 'sellerRequests', requestId);
      const requestDoc = await getDoc(requestRef);
      
      if (!requestDoc.exists()) {
        throw new Error('Request not found');
      }
      
      const requestData = requestDoc.data();

      if (action === 'approve') {
        // Update user role to seller in users collection
        const userRef = doc(db, 'users', requestData.userId);
        await updateDoc(userRef, {
          role: 'seller',
          brandName: requestData.brandName,
          approvedAt: new Date()
        });
      }

      // Update request status
      await updateDoc(requestRef, {
        status: action === 'approve' ? 'approved' : 'rejected',
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error handling seller request:', error);
      setError('Error processing seller request');
    } finally {
      setLoading(false);
    }
  };

  const handleProductRequest = async (requestId, action) => {
    try {
      setLoading(true);
      const requestRef = doc(db, 'productRequests', requestId);
      const requestDoc = await getDoc(requestRef);
      
      if (!requestDoc.exists()) {
        throw new Error('Request not found');
      }
      
      const requestData = requestDoc.data();

      if (action === 'approve') {
        // Add approved product to products collection
        const productData = {
          ...requestData,
          status: 'active',
          approvedAt: new Date(),
          createdAt: new Date()
        };
        delete productData.status; // Remove the pending status
        await addDoc(collection(db, 'products'), productData);
      }

      // Update request status
      await updateDoc(requestRef, {
        status: action === 'approve' ? 'approved' : 'rejected',
        updatedAt: new Date()
      });

      // Delete the request after processing
      await deleteDoc(requestRef);
    } catch (error) {
      console.error('Error handling product request:', error);
      setError('Error processing product request');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF9900]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('sellers')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'sellers'
              ? 'bg-[#FF9900] text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Seller Requests ({sellerRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'products'
              ? 'bg-[#FF9900] text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Product Requests ({productRequests.length})
        </button>
      </div>

      {activeTab === 'sellers' && (
        <div className="space-y-4">
          {sellerRequests.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No pending seller requests
            </div>
          ) : (
            sellerRequests.map((request) => (
              <div key={request.id} className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-bold">{request.brandName}</h3>
                <p className="text-gray-600">{request.brandDescription}</p>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Contact: {request.contactEmail}</p>
                  <p>Phone: {request.contactPhone}</p>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => handleSellerRequest(request.id, 'approve')}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleSellerRequest(request.id, 'reject')}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-4">
          {productRequests.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No pending product requests
            </div>
          ) : (
            productRequests.map((request) => (
              <div key={request.id} className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-bold">{request.productName}</h3>
                <p className="text-gray-600">{request.description}</p>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Brand: {request.brandName}</p>
                  <p>Price: ${request.price}</p>
                  <p>Category: {request.category}</p>
                  <p>Seller: {request.sellerEmail}</p>
                </div>
                {request.images && request.images.length > 0 && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {request.images.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => handleProductRequest(request.id, 'approve')}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleProductRequest(request.id, 'reject')}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminNotifications; 