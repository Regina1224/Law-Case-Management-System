import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getClientById, updateClient } from "../services/clientService";

const EditClientPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [clientType, setClientType] = useState("");
  const [status, setStatus] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const result = await getClientById(Number(id));
        setClientType(result.clientType);
        setStatus(result.status);
        setFirstName(result.firstName ?? "");
        setLastName(result.lastName ?? "");
        setOrganizationName(result.organizationName ?? "");
        setEmail(result.email ?? "");
        setPhone(result.phone ?? "");
      } catch {
        setError("Failed to load client details.");
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await updateClient(Number(id), {
        status,
        firstName: clientType === "Individual" ? firstName : undefined,
        lastName: clientType === "Individual" ? lastName : undefined,
        organizationName:
          clientType === "Corporate" ? organizationName : undefined,
        email,
        phone,
      });
      navigate(`/clients/${id}`);
    } catch {
      setError("Failed to update client.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Edit Client</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Client Type (cannot be changed)</label>
          <input value={clientType} disabled />
        </div>

        {clientType === "Individual" ? (
          <div>
            <label>First Name</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <label>Last Name</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        ) : (
          <div>
            <label>Organization Name</label>
            <input
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
            />
          </div>
        )}

        <div>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div>
          <label>Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default EditClientPage;
