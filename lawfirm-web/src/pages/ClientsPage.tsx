import { useState, useEffect } from "react";
import { getClients, type ClientListItem } from "../services/clientService";
import { Link } from "react-router-dom";

const ClientsPage = () => {
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const result = await getClients({ page: 1, pageSize: 20 });
        setClients(result.items);
        setTotalCount(result.totalCount);
      } catch {
        setError("Loading clients information failed");
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Clients</h1>
      <Link to="/clients/new">Create Client</Link>
      <p>Total: {totalCount}</p>

      <table>
        <thead>
          <tr>
            <th>Client Code</th>
            <th>Name</th>
            <th>Type</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.clientId}>
              <td>{client.clientCode}</td>
              <td>{client.clientName}</td>
              <td>{client.clientType}</td>
              <td>{client.email}</td>
              <td>{client.phone}</td>
              <td>{client.status}</td>
              <td>{client.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientsPage;
