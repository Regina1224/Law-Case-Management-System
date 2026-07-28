import { Outlet, Link } from "react-router-dom";
import AuthButton from "../components/AuthButton";
import { useIsAuthenticated } from "@azure/msal-react";
import { useCurrentUser } from "../features/auth/useCurrentUser";

const MainLayout = () => {

  const isAuthenticated = useIsAuthenticated();
  const { user } = useCurrentUser();

  return (
    <div>
      {/* Header */}
      <AuthButton />


      {/* Nav */}
      <Link to="/clients">Clients</Link>
      <Link to="/intakes">Intakes</Link>
      <Link to="/matters">Matters</Link>
      {user && user.role === "SystemAdmin" && <Link to="/admin">Admin</Link>}
      

      {/* Content */}
      {isAuthenticated ? <Outlet /> : <p>Please login first</p>}
    </div>
  );
};

export default MainLayout;
