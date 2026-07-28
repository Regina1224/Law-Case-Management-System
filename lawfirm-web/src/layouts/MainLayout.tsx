import { Outlet, Link } from "react-router-dom";
import AuthButton from "../components/AuthButton";

const MainLayout = () => {
  return (
    <div>
      {/* Header */}
      <AuthButton />


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
