import { createBrowserRouter } from "react-router-dom"
import MainLayout from "../layouts/MainLayout"
import {
    HomePage,
    ClientsPage,
    IntakesPage,
    MattersPage,
    AdminPage,
    AppUsersPage,
    CreateClientPage,
    ClientDetailPage,
    EditClientPage,
    CreateIntakePage,
    IntakeDetailPage,
    CreateMatterPage,
    MatterDetailPage,
} from "./lazyPages"

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
            { path: 'matters/create', element: <CreateMatterPage /> },
            { path: 'matters/:id', element: <MatterDetailPage /> },
            {path: 'admin', element: <AdminPage />},
            {path: 'admin/users', element: <AppUsersPage />},
        ]
    },

]);

export default router;