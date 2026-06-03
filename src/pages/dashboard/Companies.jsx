import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getCompanies } from "../../services/api";
import "../../components/employees/Employees.css";

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setActiveCompany } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await getCompanies();

      if (!response?.success) {
        throw new Error(response?.message || "Could not load companies");
      }

      setCompanies(response.data || []);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || err?.message || "Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySelect = (company) => {
    setActiveCompany(company.id, company.name);
    navigate("/dashboard/employees");
  };

  return (
    <div className="employees-page">
      <div className="employees-header">
        <h1>Companies</h1>
        <p>View and switch between company workspaces for multi-tenant access.</p>
      </div>

      <div className="employee-table-container">
        <table className="employee-table">
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Slug</th>
              <th>Employee Count</th>
              <th>User Count</th>
              <th>Access Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5}>Loading companies...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5}>{error}</td>
              </tr>
            ) : companies.length === 0 ? (
              <tr>
                <td colSpan={5}>No companies found.</td>
              </tr>
            ) : (
              companies.map((company) => (
                <tr
                  key={company.id}
                  className="clickable-row"
                  onClick={() => handleCompanySelect(company)}
                >
                  <td>
                    <strong>{company.name}</strong>
                  </td>
                  <td>{company.slug}</td>
                  <td>{company.employeeCount}</td>
                  <td>{company.userCount}</td>
                  <td>{company.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Companies;
