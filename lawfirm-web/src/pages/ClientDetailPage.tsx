import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getClientById, type ClientDetail } from "../services/clientService";
import {
  createClientContact,
  getClientContacts,
  deactivateClientContact,
  type ClientContact,
} from "../services/clientContactService";
import {
  type ClientNote,
  getClientNotes,
  createClientNote,
} from "../services/clientNoteService";
import {
  type ClientDocument,
  getClientDocuments,
  uploadClientDocument,
} from "../services/clientDocumentService";
import { downloadDocument } from "../services/documentDownload";

const ClientDetailPage = () => {
  const { id } = useParams();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [contacts, setContacts] = useState<ClientContact[]>([]);
  const [contactName, setContactName] = useState("");
  const [relationshipType, setRelationshipType] = useState("");
  const [addingContact, setAddingContact] = useState(false);

  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState("Client ID");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const result = await getClientNotes(Number(id));
        setNotes(result);
      } catch {
        //
      }
    };
    fetchNotes();
  }, [id]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const result = await getClientDocuments(Number(id));
        setDocuments(result);
      } catch {
        // Failure to load documents does not affect the display of the main details page
      }
    };
    fetchDocuments();
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

  const handleDeactivateContact = async (contactId: number) => {
    try {
      await deactivateClientContact(Number(id), contactId);
      const result = await getClientContacts(Number(id));
      setContacts(result);
    } catch {
      // A dedicated contactError state could be added to display the error; for now, we'll handle it simply.
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingNote(true);

    try {
      await createClientNote(Number(id), {
        noteTitle,
        noteContent,
      });

      const result = await getClientNotes(Number(id));
      setNotes(result);

      setNoteTitle("");
      setNoteContent("");
    } catch {
      //
    } finally {
      setAddingNote(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadFile || !uploadCategory) {
      setUploadError("Please select a file and category.");
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      await uploadClientDocument(
        Number(id),
        uploadFile,
        uploadCategory,
        uploadDescription
      );
      const refreshedDocs = await getClientDocuments(Number(id));
      setDocuments(refreshedDocs);
      setUploadFile(null);
      setUploadDescription("");
    } catch {
      setUploadError("Failed to upload document.");
    } finally {
      setUploading(false);
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
              <th></th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.clientContactId}>
                <td>{contact.contactName}</td>
                <td>{contact.relationshipType}</td>
                <td>{contact.email}</td>
                <td>{contact.phone}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleDeactivateContact(contact.clientContactId)}
                  >
                    Deactivate
                  </button>
                </td>
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

      <h2>Notes</h2>
      {notes.length === 0 ? (
        <p>No notes yet.</p>
      ) : (
        <div>
          {notes.map((note) => (
            <div key={note.clientNoteId}>
              <h4>{note.noteTitle}</h4>
              <p>{note.noteContent}</p>
              <small>{note.noteType}</small>
            </div>
          ))}
        </div>
      )}

      <h3>Add Note</h3>
      <form onSubmit={handleAddNote}>
        <div>
          <label>Note Title</label>
          <input
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
          />
        </div>
        <div>
          <label>Note Content</label>
          <input
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
          />
        </div>
        <button type="submit" disabled={addingNote}>
          {addingNote ? "Adding..." : "Add Note"}
        </button>
      </form>

      <h2>Documents</h2>

      {documents.length === 0 ? (
        <p>No documents yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>File Name</th>
              <th>Category</th>
              <th>Description</th>
              <th>Size</th>
              <th>Uploaded At</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.documentId}>
                <td>{doc.originalFileName}</td>
                <td>{doc.documentCategory}</td>
                <td>{doc.description ?? "-"}</td>
                <td>{(doc.fileSizeBytes / 1024).toFixed(1)} KB</td>
                <td>{new Date(doc.uploadedAt).toLocaleString()}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => downloadDocument(doc.documentId, doc.originalFileName)}
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>Upload Document</h3>
      {uploadError && <p style={{ color: "red" }}>{uploadError}</p>}
      <form onSubmit={handleUpload}>
        <div>
          <label>File</label>
          <input
            type="file"
            onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <div>
          <label>Category</label>
          <select
            value={uploadCategory}
            onChange={(e) => setUploadCategory(e.target.value)}
          >
            <option value="Client ID">Client ID</option>
            <option value="Engagement Documents">Engagement Documents</option>
            <option value="Correspondence">Correspondence</option>
            <option value="Internal Draft">Internal Draft</option>
          </select>
        </div>

        <div>
          <label>Description</label>
          <input
            value={uploadDescription}
            onChange={(e) => setUploadDescription(e.target.value)}
          />
        </div>

        <button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
};

export default ClientDetailPage;
