import products from "../data/products";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white p-4 rounded shadow hover:shadow-lg cursor-pointer"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          <img src={product.image} alt={product.name} className="w-full h-48 object-cover mb-2 rounded" />
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p className="text-sm text-gray-600">{product.price}</p>
        </div>
      ))}
    </div>
  );
}
