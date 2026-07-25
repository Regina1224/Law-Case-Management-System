import { createBrowserRouter } from "react-router-dom"
import MainLayout from "../layouts/MainLayout"
import HomePage from "../pages/HomePage"
import ClientsPage from "../pages/ClientsPage"
import IntakesPage from "../pages/IntakesPage"
import MattersPage from "../pages/MattersPage"
import AdminPage from "../pages/AdminPage"


const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            {index: true, element: <HomePage />},
            {path: 'clients', element: <ClientsPage />},
            {path: 'intakes', element: <IntakesPage />},
            {path: 'matters', element: <MattersPage />},
            {path: 'admin', element: <AdminPage />},
        ]
    },

]);

export default router;