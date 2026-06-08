import { useState, useEffect } from "react";
import { FaBell, FaTimes, FaCheckCircle, FaTimesCircle, FaInfoCircle } from "react-icons/fa";
import { getNotifications, clearNotifications } from "../../services/api";

export default function NotificationCenter() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getNotifications();
      if (response?.success) {
        setNotifications(response?.data || []);
        setUnreadCount(response?.unreadCount || 0);
      } else {
        const message = response?.message || "Unable to load notifications";
        setError(message);
        console.error("Failed to fetch notifications", message);
      }
    } catch (error) {
      const message = error?.message || "Failed to fetch notifications";
      setError(message);
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();

    const handleEmployeesChanged = () => {
      fetchNotifications();
    };

    const onStorage = (e) => {
      if (e.key === "employees_changed_at") {
        fetchNotifications();
      }
    };

    // Poll for new notifications every 20 seconds
    const interval = setInterval(fetchNotifications, 20000);

    window.addEventListener("employeesChanged", handleEmployeesChanged);
    window.addEventListener("storage", onStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("employeesChanged", handleEmployeesChanged);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const handleRefreshNotifications = () => {
    fetchNotifications();
  };

  const handleClearNotifications = async () => {
    try {
      const response = await clearNotifications();
      if (response.success) {
        setUnreadCount(0);
        setNotifications([]);
      } else {
        console.error("Failed to clear notifications", response.message);
      }
    } catch (error) {
      console.error("Failed to clear notifications", error);
    }
  };

  const getActionIcon = (action) => {
    if (action?.includes("Approved")) return <FaCheckCircle className="text-green-500" />;
    if (action?.includes("Rejected")) return <FaTimesCircle className="text-red-500" />;
    return <FaInfoCircle className="text-blue-500" />;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="text-gray-600 hover:text-gray-900 relative transition"
      >
        <FaBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 rounded-full font-semibold">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 top-12 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
            <div>
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              <p className="text-xs text-gray-500">All changes and updates appear here</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearNotifications}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : notifications?.length > 0 ? (
            <div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-3 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getActionIcon(notification.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 break-words">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTime(notification.timestamp)}
                        </p>
                        {!notification.is_read && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded mt-1 inline-block">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={handleRefreshNotifications}
                  className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Refresh
                </button>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : (
            <div className="p-4 text-center text-gray-500">No notifications yet</div>
          )}
        </div>
      )}
    </div>
  );
}
