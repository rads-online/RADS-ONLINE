import { useParams } from "react-router-dom";
import products from "../data/products";

export default function ProductPage() {
  const { id } = useParams();
  const product = products.find((p) => p.id === parseInt(id));

  if (!product) return <p className="p-6">Product not found.</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded shadow">
      <div className="flex flex-col md:flex-row gap-6">
        <img src={product.image} alt={product.name} className="w-full md:w-1/2 h-80 object-cover rounded" />
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{product.name}</h2>
          <p className="text-lg font-semibold text-green-600">{product.price}</p>
          <p className="text-gray-700">{product.description}</p>
          <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 bg-yellow-500 hover:bg-yellow-400 text-white font-medium px-6 py-2 rounded"
          >
            Buy Now
          </a>
        </div>
      </div>
    </div>
  );
}
