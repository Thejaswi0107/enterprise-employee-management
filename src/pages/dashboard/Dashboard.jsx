import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getDepartments, getEmployees, getDashboardAnalytics } from "../../services/api";
import {
  FaUsers,
  FaUserCheck,
  FaBuilding,
  FaBell,
} from "react-icons/fa";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

function Dashboard() {
  const { user, activeCompany } = useAuth();
  const isAdmin = user?.role === "admin";
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [employeeResponse, departmentResponse, analyticsResponse] = await Promise.all([
        getEmployees(),
        getDepartments(),
        getDashboardAnalytics(),
      ]);

      setEmployees(employeeResponse.data || []);
      setDepartments(departmentResponse.data || []);
      setAnalytics(analyticsResponse.data || null);
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboard();
  }, [activeCompany]);

  // Listen for employee changes and auto-refresh dashboard
  useEffect(() => {
    const handleEmployeesChanged = () => {
      loadDashboard();
    };

    window.addEventListener("employeesChanged", handleEmployeesChanged);
    return () => {
      window.removeEventListener("employeesChanged", handleEmployeesChanged);
    };
  }, []);

  // Listen for storage events for multi-tab sync
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "employees_changed_at") {
        loadDashboard();
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleRefreshDashboard = async () => {
    setRefreshing(true);
    try {
      const [employeeResponse, departmentResponse, analyticsResponse] = await Promise.all([
        getEmployees(),
        getDepartments(),
        getDashboardAnalytics(),
      ]);

      setEmployees(employeeResponse.data || []);
      setDepartments(departmentResponse.data || []);
      setAnalytics(analyticsResponse.data || null);
    } catch (error) {
      console.error("Failed to refresh dashboard data", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Calculate stats dynamically from employees data
  // Filter employees by company for non-admin users
  const filteredEmployees = isAdmin 
    ? employees 
    : employees.filter(emp => emp.company_id === user?.company_id);

  // Calculate stats from filtered employees
  const calculatedTotalEmployees = filteredEmployees.length;
  const calculatedActiveEmployees = filteredEmployees.filter(
    (emp) => emp.status?.toLowerCase() === "active"
  ).length;
  
  // Get unique departments from employees in the company
  const uniqueDepartments = new Set(filteredEmployees.map(emp => emp.department).filter(Boolean));
  const calculatedTotalDepartments = uniqueDepartments.size;

  // Use calculated stats, fallback to analytics if available
  const totalEmployees = analytics?.totalEmployees ?? calculatedTotalEmployees;
  const activeEmployees = analytics?.activeEmployees ?? calculatedActiveEmployees;
  const totalDepartments = analytics?.totalDepartments ?? calculatedTotalDepartments;
  const pendingRequests = analytics?.pendingRequests ?? 0;
  const attendanceRate = totalEmployees
    ? Math.round((activeEmployees / totalEmployees) * 100)
    : 0;

  const stats = [
    {
      title: "Total Employees",
      value: totalEmployees,
      icon: <FaUsers className="text-blue-600" />,
      bg: "bg-blue-100",
      path: "/dashboard/employees",
    },
    {
      title: "Active Employees",
      value: activeEmployees,
      icon: <FaUserCheck className="text-green-600" />,
      bg: "bg-green-100",
      path: "/dashboard/employees?status=Active",
    },
    ...(
      isAdmin
        ? [
            {
              title: "Departments",
              value: totalDepartments,
              icon: <FaBuilding className="text-orange-600" />,
              bg: "bg-orange-100",
              path: "/dashboard/departments",
            },
            {
              title: "Pending Requests",
              value: pendingRequests,
              icon: <FaBell className="text-purple-600" />,
              bg: "bg-purple-100",
              path: "/dashboard/role-change-management",
            },
          ]
        : [])
  ];

  const departmentData = analytics?.employeesByDepartment?.length
    ? analytics.employeesByDepartment.map((entry) => ({
        name: entry.department,
        value: entry.count,
      }))
    : Array.from(uniqueDepartments).map((departmentName) => {
        const departmentCount = filteredEmployees.filter(
          (employee) => employee.department === departmentName
        ).length;

        return {
          name: departmentName,
          value: departmentCount || 1,
        };
      });

  const roleData = analytics?.employeesByRole?.length
    ? analytics.employeesByRole
    : filteredEmployees.reduce((acc, employee) => {
        const existing = acc.find((item) => item.role === employee.role);
        if (existing) existing.count += 1;
        else acc.push({ role: employee.role || "Unknown", count: 1 });
        return acc;
      }, []);

  const statusData = analytics?.statusOverview?.length
    ? analytics.statusOverview
    : [
        { status: "Active", count: activeEmployees },
        { status: "Inactive", count: totalEmployees - activeEmployees },
      ];

  const chartData = [
    { day: "Mon", employees: Math.max(totalEmployees - 10, 0) },
    { day: "Tue", employees: Math.max(totalEmployees - 5, 0) },
    { day: "Wed", employees: totalEmployees },
    { day: "Thu", employees: Math.max(totalEmployees - 2, 0) },
    { day: "Fri", employees: Math.max(totalEmployees - 8, 0) },
    { day: "Sat", employees: Math.max(totalEmployees - 14, 0) },
    { day: "Sun", employees: Math.max(totalEmployees - 20, 0) },
  ];

  const recentEmployees = [...filteredEmployees]
    .sort(
      (a, b) => new Date(b.joined_date) - new Date(a.joined_date)
    )
    .slice(0, 4);

  const COLORS = [
    "#2563eb",
    "#16a34a",
    "#f59e0b",
    "#ef4444",
  ];

  if (loading) {
    return (
      <div className="w-full py-14 text-center text-gray-600">
        Loading dashboard data...
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">
            Dashboard
          </h1>

          <p className="text-gray-500 mt-2">
            Welcome back, {user?.name || "Team Member"}! Here's what's happening.
          </p>
          {!isAdmin && (
            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600 shadow-sm">
              This is your user dashboard. Administrator users can manage company members, invitations, and reactivation requests from the sidebar.
            </div>
          )}
        </div>

        <button
          onClick={handleRefreshDashboard}
          disabled={refreshing}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-5 mb-8">
        {stats.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              const [pathname, query] = item.path.split("?");
              navigate({ pathname, search: query ? `?${query}` : "" });
            }}
            className="text-left bg-white rounded-2xl shadow-sm border p-5 transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">{item.title}</p>
                <h2 className="text-3xl font-bold mt-2">{item.value}</h2>
              </div>

              <div className={`${item.bg} p-4 rounded-full text-xl`}>
                {item.icon}
              </div>
            </div>
          </button>
        ))}
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          <button
            onClick={() => navigate("/dashboard/invitations")}
            className="text-left bg-white rounded-2xl shadow-sm border p-6 transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <h3 className="text-lg font-semibold mb-2">Manage Invitations</h3>
            <p className="text-sm text-gray-600">Create and revoke company invitations for new users.</p>
          </button>

          <button
            onClick={() => navigate("/dashboard/members")}
            className="text-left bg-white rounded-2xl shadow-sm border p-6 transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <h3 className="text-lg font-semibold mb-2">Company Members</h3>
            <p className="text-sm text-gray-600">View active and deactivated members across your company.</p>
          </button>

          <button
            onClick={() => navigate("/dashboard/reactivation-requests")}
            className="text-left bg-white rounded-2xl shadow-sm border p-6 transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <h3 className="text-lg font-semibold mb-2">Reactivation Requests</h3>
            <p className="text-sm text-gray-600">Review and approve or reject user reactivation submissions.</p>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Employee Overview</h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="employees"
                stroke="#2563eb"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Department Distribution</h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={departmentData} dataKey="value" outerRadius={100} label>
                {departmentData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Role Distribution</h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roleData}>
              <XAxis dataKey="role" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Status Overview</h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={statusData} dataKey="count" nameKey="status" outerRadius={100} label>
                {statusData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Employees</h2>

        <div className="space-y-4">
          {recentEmployees.length > 0 ? (
            recentEmployees.map((employee, index) => (
              <div
                key={index}
                className="flex justify-between items-center border-b pb-3"
              >
                <div>
                  <p className="font-medium">{employee.name}</p>
                  <p className="text-sm text-gray-500">{employee.role}</p>
                </div>

                <span className="text-sm text-gray-400">
                  {employee.joined_date}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No recent employees available.</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">Employee Activity Overview</h2>

        <div className="space-y-4 text-sm text-gray-600">
          <div className="border-b pb-3">
            {activeEmployees} active employees out of {totalEmployees}
          </div>

          <div className="border-b pb-3">
            {totalDepartments} active departments maintained.
          </div>

          <div className="border-b pb-3">
            Attendance rate tracked at {attendanceRate}% this week.
          </div>

          <div>Dashboard refreshed from live employee data.</div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
             