import {
  FaBell,
  FaSearch,
  FaUserCircle,
  FaBars,
} from "react-icons/fa";

function Navbar() {
  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
      {/* Left Side */}
      <div className="flex items-center gap-4">
        <button className="text-gray-500 hover:text-gray-700">
          <FaBars size={20} />
        </button>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-6">
        {/* Date */}
        <div className="hidden md:block bg-gray-100 px-4 py-2 rounded-lg text-sm text-gray-600">
          {today}
        </div>

        {/* Notification */}
        <div className="relative cursor-pointer">
          <FaBell className="text-xl text-gray-500" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 rounded-full">
            3
          </span>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-2 cursor-pointer">
          <FaUserCircle className="text-3xl text-gray-600" />
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-700">Admin User</p>
            <p className="text-xs text-gray-400">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;