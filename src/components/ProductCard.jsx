import React, { useState } from "react";
import { FaEdit, FaTrash, FaStar, FaStarHalfAlt } from "react-icons/fa";

export default function ProductCard({
  title,
  price,
  imageURL,
  description,
  affiliateURL,
  onDelete,
  onEdit,
  showActions,
}) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  // Generate random rating for demo
  const rating = (Math.random() * 2 + 3).toFixed(1);
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div
      className="bg-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-w-1 aspect-h-1 bg-gray-100">
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <p className="text-gray-500 text-sm">Image not available</p>
          </div>
        ) : (
          <img
            src={imageURL}
            alt={title}
            className="w-full h-48 object-contain p-4"
            onError={handleImageError}
          />
        )}
        {showActions && (
          <div
            className={`absolute top-2 right-2 flex gap-2 transition-opacity duration-200 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <button
              onClick={onEdit}
              className="p-2 bg-[#FF9900] text-white rounded-full hover:bg-[#FF8C00] transition-colors"
              aria-label="Edit product"
            >
              <FaEdit />
            </button>
            <button
              onClick={onDelete}
              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              aria-label="Delete product"
            >
              <FaTrash />
            </button>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2 hover:text-[#FF9900] transition-colors">
          {title}
        </h3>
        <div className="flex items-center mb-2">
          <div className="flex text-[#FF9900]">
            {[...Array(fullStars)].map((_, i) => (
              <FaStar key={`full-${i}`} />
            ))}
            {hasHalfStar && <FaStarHalfAlt />}
            {[...Array(emptyStars)].map((_, i) => (
              <FaStar key={`empty-${i}`} className="text-gray-300" />
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-2">{rating}</span>
        </div>
        <p className="text-gray-600 mb-2 line-clamp-2 text-sm">{description}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-gray-900">₹{price}</span>
            <span className="text-sm text-gray-500 ml-1">M.R.P</span>
          </div>
          <a
            href={affiliateURL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#FF9900] text-white rounded-md hover:bg-[#FF8C00] transition-colors text-sm font-medium"
          >
            Buy Now
          </a>
        </div>
      </div>
    </div>
  );
}
