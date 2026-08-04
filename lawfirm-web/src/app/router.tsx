import { createBrowserRouter } from "react-router-dom"
import MainLayout from "../layouts/MainLayout"
import HomePage from "../pages/HomePage"
import ClientsPage from "../pages/ClientsPage"
import IntakesPage from "../pages/IntakesPage"
import MattersPage from "../pages/MattersPage"
import AdminPage from "../pages/AdminPage"
import CreateClientPage from "../pages/CreateClientPage"
import ClientDetailPage from "../pages/ClientDetailPage"
import EditClientPage from "../pages/EditClientPage"
import CreateIntakePage from "../pages/CreateIntakePage"
import IntakeDetailPage from "../pages/IntakeDetailPage"

const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            {index: true, element: <HomePage />},
            {path: 'clients', element: <ClientsPage />},
            {path: 'clients/new', element: <CreateClientPage />},
            {path: 'clients/:id', element: <ClientDetailPage />},
            {path: 'clients/:id/edit', element: <EditClientPage />},
            {path: 'intakes', element: <IntakesPage />},
            {path: 'intakes/create', element: <CreateIntakePage />},
            { path: 'intakes/:id', element: <IntakeDetailPage /> },
            {path: 'matters', element: <MattersPage />},
            {path: 'admin', element: <AdminPage />},
        ]
    },

]);

export default router;