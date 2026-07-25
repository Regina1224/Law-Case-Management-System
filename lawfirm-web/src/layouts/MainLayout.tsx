import { Outlet, Link } from "react-router-dom";

const MainLayout = () => {
  return (
    <div>
      {/* Header */}
      <h1>User information</h1>

      {/* Nav */}
      <Link to="/clients">Clients</Link>
      <Link to="/intakes">Intakes</Link>
      <Link to="/matters">Matters</Link>
      <Link to="/admin">Admin</Link>

      {/* Content */}
      <Outlet />
    </div>
  );
};

export default MainLayout;
