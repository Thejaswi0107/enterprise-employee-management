const EmployeeStatCard = ({ title, value, detail }) => {
  return (
    <div className="stat-card">
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-title">{title}</div>
      <div className="stat-card-detail">{detail}</div>
    </div>
  );
};

export default EmployeeStatCard;
