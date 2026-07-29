import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "../services/clientService";

const CreateClientPage = () => {
  const navigate = useNavigate();

  const [clientType, setClientType] = useState("Individual");
  const [status, setStatus] = useState("Active Client");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await createClient({
        clientType,
        status,
        firstName: clientType === "Individual" ? firstName : undefined,
        lastName: clientType === "Individual" ? lastName : undefined,
        organizationName:
          clientType === "Corporate" ? organizationName : undefined,
        email,
        phone,
      });

      navigate("/clients");
    } catch (err) {
      setError("Failed to create client. Please check your input.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Create Client</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Client Type</label>
          <select
            value={clientType}
            onChange={(e) => setClientType(e.target.value)}
          >
            <option value="Individual">Individual</option>
            <option value="Corporate">Corporate</option>
          </select>
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
          {submitting ? "Creating..." : "Create Client"}
        </button>
      </form>
    </div>
  );
};

export default CreateClientPage;
