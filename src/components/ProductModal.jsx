import { useState, useEffect } from "react";

export default function ProductUploadModal({
  onClose,
  onAddProduct,
  onEditProduct,
  product,
}) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [affiliateURL, setAffiliateURL] = useState("");
  const [imageURL, setImageURL] = useState(""); // Added image URL state

  useEffect(() => {
    // If a product is being edited, pre-fill the form fields
    if (product) {
      setTitle(product.title);
      setPrice(product.price);
      setDescription(product.description);
      setAffiliateURL(product.affiliateURL);
      setImageURL(product.imageURL); // Set the image URL when editing
    }
  }, [product]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const newProduct = {
      title,
      price,
      description,
      affiliateURL,
      imageURL, // Include the image URL in the product object
    };

    if (product) {
      // If editing, update the product
      onEditProduct({ ...newProduct, title: product.title });
    } else {
      // If adding new product
      onAddProduct(newProduct);
    }

    // Reset the form and close the modal
    setTitle("");
    setPrice("");
    setDescription("");
    setAffiliateURL("");
    setImageURL(""); // Clear image URL field
    onClose();
  };

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-1/3">
        <h2 className="text-xl font-bold mb-4">{product ? "Edit" : "Add"} Product</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Title</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Price</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Affiliate URL</label>
            <input
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={affiliateURL}
              onChange={(e) => setAffiliateURL(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Image URL</label> {/* Added image URL field */}
            <input
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={imageURL}
              onChange={(e) => setImageURL(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            {product ? "Save Changes" : "Add Product"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="ml-4 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
