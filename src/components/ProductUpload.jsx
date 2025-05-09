import { useState } from "react";

export default function ProductUpload({ onAddProduct }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [url, setUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProduct = { id: Date.now(), title, description, image, url };
    onAddProduct(newProduct);
    setTitle("");
    setDescription("");
    setImage("");
    setUrl("");
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Upload Product</h2>
      <input
        type="text"
        placeholder="Product Title"
        className="w-full p-2 border mb-2"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Product Description"
        className="w-full p-2 border mb-2"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Image URL"
        className="w-full p-2 border mb-2"
        value={image}
        onChange={(e) => setImage(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Affiliate URL"
        className="w-full p-2 border mb-2"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
      />
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Add Product</button>
    </form>
  );
}
