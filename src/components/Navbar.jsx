import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { FaUser, FaChevronDown, FaShoppingBag } from "react-icons/fa";

export default function Navbar({ user, userRole }) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const navigate = useNavigate();

  const categories = [
    {
      name: "Electronics",
      subcategories: [
        "Smartphones",
        "Laptops",
        "Tablets",
        "Accessories",
        "Audio Devices",
        "Wearables"
      ]
    },
    {
      name: "Fashion & Apparel",
      subcategories: [
        "Men's Clothing",
        "Women's Clothing",
        "Kids' Fashion",
        "Footwear",
        "Accessories",
        "Jewelry"
      ]
    },
    {
      name: "Beauty & Wellness",
      subcategories: [
        "Skincare",
        "Makeup",
        "Haircare",
        "Fragrances",
        "Personal Care",
        "Health Supplements"
      ]
    },
    {
      name: "Home & Kitchen",
      subcategories: [
        "Furniture",
        "Kitchen Appliances",
        "Home Decor",
        "Bedding",
        "Bath",
        "Storage"
      ]
    },
    {
      name: "Books & Stationery",
      subcategories: [
        "Books",
        "Notebooks",
        "Pens & Pencils",
        "Art Supplies",
        "Office Supplies",
        "Gift Items"
      ]
    },
    {
      name: "Software & Tools",
      subcategories: [
        "Development Tools",
        "Design Software",
        "Business Software",
        "Security Tools",
        "Cloud Services",
        "Utilities"
      ]
    }
  ];

  const moreCategories = [
    {
      name: "Fitness & Health",
      subcategories: [
        "Exercise Equipment",
        "Sports Gear",
        "Fitness Trackers",
        "Yoga & Meditation",
        "Nutrition",
        "Health Monitors"
      ]
    },
    {
      name: "Online Courses",
      subcategories: [
        "Programming",
        "Design",
        "Business",
        "Marketing",
        "Language Learning",
        "Personal Development"
      ]
    },
    {
      name: "Gaming & Gadgets",
      subcategories: [
        "Gaming Consoles",
        "Gaming Accessories",
        "Gaming Laptops",
        "Gaming Headsets",
        "Gaming Chairs",
        "Gaming Peripherals"
      ]
    },
    {
      name: "Toys & Baby",
      subcategories: [
        "Toys",
        "Baby Care",
        "Baby Clothing",
        "Nursery",
        "Feeding",
        "Strollers"
      ]
    },
    {
      name: "Pet Supplies",
      subcategories: [
        "Dog Supplies",
        "Cat Supplies",
        "Pet Food",
        "Pet Toys",
        "Pet Grooming",
        "Pet Health"
      ]
    }
  ];

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="bg-[#131921] text-white">
      {/* Top Bar */}
      <div className="border-b border-[#232F3E]">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-white">
            RADS Online
          </Link>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 hover:text-[#FF9900] transition-colors">
                  <FaUser />
                  <span>{user.email}</span>
                  <FaChevronDown className="text-xs" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {userRole === "seller" && (
                    <Link
                      to="/seller-dashboard"
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                      Seller Dashboard
                    </Link>
                  )}
                  {userRole === "admin" && (
                    <Link
                      to="/admin-dashboard"
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-2 hover:text-[#FF9900] transition-colors"
              >
                <FaUser />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="border-b border-[#232F3E]">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for products..."
              className="w-full px-4 py-2 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF9900]"
            />
          </div>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="border-b border-[#232F3E]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center space-x-6 py-2">
            {categories.map((category) => (
              <div
                key={category.name}
                className="relative group"
                onMouseEnter={() => setActiveCategory(category.name)}
                onMouseLeave={() => setActiveCategory(null)}
              >
                <button className="flex items-center space-x-1 text-sm hover:text-[#FF9900] transition-colors">
                  <span>{category.name}</span>
                  <FaChevronDown className="text-xs" />
                </button>
                {activeCategory === category.name && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    {category.subcategories.map((subcategory) => (
                      <a
                        key={subcategory}
                        href="#"
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                      >
                        {subcategory}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div
              className="relative group"
              onMouseEnter={() => setShowMoreCategories(true)}
              onMouseLeave={() => setShowMoreCategories(false)}
            >
              <button className="flex items-center space-x-1 text-sm hover:text-[#FF9900] transition-colors">
                <span>More</span>
                <FaChevronDown className="text-xs" />
              </button>
              {showMoreCategories && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  {moreCategories.map((category) => (
                    <div
                      key={category.name}
                      className="relative group/sub"
                      onMouseEnter={() => setActiveCategory(category.name)}
                      onMouseLeave={() => setActiveCategory(null)}
                    >
                      <button className="flex items-center justify-between w-full px-4 py-2 text-gray-800 hover:bg-gray-100">
                        <span>{category.name}</span>
                        <FaChevronDown className="text-xs" />
                      </button>
                      {activeCategory === category.name && (
                        <div className="absolute left-full top-0 w-48 bg-white rounded-md shadow-lg py-1">
                          {category.subcategories.map((subcategory) => (
                            <a
                              key={subcategory}
                              href="#"
                              className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                            >
                              {subcategory}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
