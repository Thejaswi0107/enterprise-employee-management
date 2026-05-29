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
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

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

  const chartData = [
    { day: "Mon", employees: 180 },
    { day: "Tue", employees: 200 },
    { day: "Wed", employees: 240 },
    { day: "Thu", employees: 260 },
    { day: "Fri", employees: 230 },
    { day: "Sat", employees: 190 },
    { day: "Sun", employees: 170 },
  ];

  const employees = [
    { name: "John Doe", role: "Developer" },
    { name: "Jane Smith", role: "Designer" },
    { name: "Michael Johnson", role: "HR Manager" },
    { name: "Emily Davis", role: "Data Analyst" },
  ];


  const departmentData = [
    { name: "HR", value: 12 },
    { name: "IT", value: 35 },
    { name: "Finance", value: 10 },
    { name: "Design", value: 8 },
  ];

  const attendanceData = [
    { day: "Mon", attendance: 90 },
    { day: "Tue", attendance: 85 },
    { day: "Wed", attendance: 95 },
    { day: "Thu", attendance: 88 },
    { day: "Fri", attendance: 92 },
  ];

  const COLORS = [
    "#2563eb",
    "#16a34a",
    "#f59e0b",
    "#ef4444",
  ];

  return (
    <div className="w-full">
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">
          Dashboard
        </h1>

        <p className="text-gray-500 mt-2">
          Welcome back, Admin! Here's what's happening.
        </p>
      </div>

        <div className="grid grid-cols-4 gap-5 mb-8">
        {stats.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-sm border p-5"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">
                  {item.title}
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {item.value}
                </h2>
              </div>

              <div
                className={`${item.bg} p-4 rounded-full text-xl`}
              >
                {item.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
      
     
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

  
  <div className="bg-white rounded-2xl shadow-sm border p-6">
    <h2 className="text-xl font-semibold mb-4">
      Employee Overview
    </h2>

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

  {/* Department Distribution */}
  <div className="bg-white rounded-2xl shadow-sm border p-6">
    <h2 className="text-xl font-semibold mb-4">
      Department Distribution
    </h2>

    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={departmentData}
          dataKey="value"
          outerRadius={100}
          label
        >
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
                <h2 className="text-xl font-semibold mb-4">
                  Attendance Analytics
                </h2>

                <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar
                dataKey="attendance"
                fill="#2563eb"
                />
                </BarChart>
                </ResponsiveContainer>
            </div>

                <div className="bg-white rounded-2xl shadow-sm border p-6">
                    <h2 className="text-xl font-semibold mb-4">
                     Recent Employees
                    </h2>

                    <div className="space-y-4">
                        {employees.map((employee, index) => (
                         <div
                            key={index}
                            className="flex justify-between items-center border-b pb-3"
                              >
                            <div>
                                <p className="font-medium">
                                 {employee.name}
                                </p>

                                <p className="text-sm text-gray-500">
                                    {employee.role}
                                </p>
                            </div>

                            <span className="text-sm text-gray-400">
                                May 21, 2025
                            </span>
                        </div>
                        ))}
                    </div>
                </div>

    </div>


    <div className="bg-white rounded-2xl shadow-sm border p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">
            Employee Activity Overview
        </h2>

        <div className="space-y-4">
            <div className="border-b pb-3">
                 New employee added
            </div>

            <div className="border-b pb-3">
              Employee details updated
            </div>

            <div className="border-b pb-3">
                 New department created
            </div>

            <div>
                 Attendance marked
            </div>
        </div>
    </div>
  </div>

  );
}

export default Dashboard;