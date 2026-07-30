import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getClientById, type ClientDetail } from "../services/clientService";

const ClientDetailPage = () => {
  const { id } = useParams();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const result = await getClientById(Number(id));
        setClient(result);
      } catch {
        setError(`Failed to load the detail page of client id:${id}.`);
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!client) return null;

  return (
    <div>
      <div>
        <Link to="/clients">← Back to Clients</Link>
      </div>
      <div>
        <Link to={`/clients/${client.clientId}/edit`}>Edit</Link>
      </div>
      <h1>{client.clientName}</h1>
      <p>Client Code: {client.clientCode}</p>
      <p>Type: {client.clientType}</p>
      <p>Status: {client.status}</p>
      <p>Email: {client.email}</p>
      <p>Phone: {client.phone}</p>
      <p>
        Address: {client.addressLine1}, {client.city}, {client.state}{" "}
        {client.postcode}
      </p>
      <p>Notes: {client.internalNotesSummary}</p>
    </div>
  );
};

export default ClientDetailPage;
