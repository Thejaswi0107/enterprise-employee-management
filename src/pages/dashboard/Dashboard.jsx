import {
  FaUsers,
  FaUserCheck,
  FaClipboardCheck,
  FaBuilding,
} from "react-icons/fa";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const chartData = [
  { day: "Mon", employees: 180 },
  { day: "Tue", employees: 200 },
  { day: "Wed", employees: 240 },
  { day: "Thu", employees: 260 },
  { day: "Fri", employees: 230 },
  { day: "Sat", employees: 190 },
  { day: "Sun", employees: 170 },
];

function Dashboard() {
  const stats = [
    {
      title: "Total Employees",
      value: "256",
      icon: <FaUsers className="text-blue-600" />,
      bg: "bg-blue-100",
    },
    {
      title: "Active Employees",
      value: "210",
      icon: <FaUserCheck className="text-green-600" />,
      bg: "bg-green-100",
    },
    {
      title: "Attendance Today",
      value: "92%",
      icon: <FaClipboardCheck className="text-purple-600" />,
      bg: "bg-purple-100",
    },
    {
      title: "Departments",
      value: "12",
      icon: <FaBuilding className="text-orange-600" />,
      bg: "bg-orange-100",
    },
  ];

  const employees = [
    { name: "John Doe", role: "Developer" },
    { name: "Jane Smith", role: "Designer" },
    { name: "Michael Johnson", role: "HR Manager" },
    { name: "Emily Davis", role: "Data Analyst" },
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-2">
          Welcome back, Admin! Here's what's happening.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {stats.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-sm border p-5"
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
          </div>
        ))}
      </div>

      {/* Bottom Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Employee Overview</h2>

          <ResponsiveContainer width="100%" height={250}>
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

        {/* Recent Employees */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Employees</h2>

          <div className="space-y-4">
            {employees.map((employee, index) => (
              <div
                key={index}
                className="flex justify-between items-center border-b pb-3"
              >
                <div>
                  <p className="font-medium">{employee.name}</p>
                  <p className="text-sm text-gray-500">{employee.role}</p>
                </div>

                <span className="text-sm text-gray-400">May 21, 2025</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;