import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getClientById, type ClientDetail } from "../services/clientService";
import {
  createClientContact,
  getClientContacts,
  type ClientContact,
} from "../services/clientContactService";

const ClientDetailPage = () => {
  const { id } = useParams();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [contacts, setContacts] = useState<ClientContact[]>([]);
  const [contactName, setContactName] = useState("");
  const [relationshipType, setRelationshipType] = useState("");
  const [addingContact, setAddingContact] = useState(false);

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

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const result = await getClientContacts(Number(id));
        setContacts(result);
      } catch {
        // Failure to load contacts does not affect the display of the main details page
      }
    };
    fetchContacts();
  }, [id]);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingContact(true);

    try {
      await createClientContact(Number(id), {
        contactName,
        relationshipType,
      });

      // Retrieve the contact list again so that newly added contacts appear immediately.
      const result = await getClientContacts(Number(id));
      setContacts(result);

      setContactName("");
      setRelationshipType("");
    } catch {
      // A dedicated contactError state could be added to display the error; for now, we'll handle it simply.
    } finally {
      setAddingContact(false);
    }
  };


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

      <h2>Related Contacts</h2>

      {contacts.length === 0 ? (
        <p>No contacts yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Relationship</th>
              <th>Email</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.clientContactId}>
                <td>{contact.contactName}</td>
                <td>{contact.relationshipType}</td>
                <td>{contact.email}</td>
                <td>{contact.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>Add Contact</h3>
      <form onSubmit={handleAddContact}>
        <div>
          <label>Contact Name</label>
          <input
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
          />
        </div>
        <div>
          <label>Relationship Type</label>
          <input
            value={relationshipType}
            onChange={(e) => setRelationshipType(e.target.value)}
          />
        </div>
        <button type="submit" disabled={addingContact}>
          {addingContact ? "Adding..." : "Add Contact"}
        </button>
      </form>
    </div>
  );
};

export default ClientDetailPage;
