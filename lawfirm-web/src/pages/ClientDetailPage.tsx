import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, AlertTriangle } from "lucide-react";
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
  deleteClientNote,
} from "../services/clientNoteService";
import {
  type ClientDocument,
  getClientDocuments,
  uploadClientDocument,
} from "../services/clientDocumentService";
import { downloadDocument } from "../services/documentDownload";
import ClientStatusBadge from "@/components/ClientStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const contactSchema = z.object({
  contactName: z.string().min(1, "Contact name is required."),
  relationshipType: z.string().min(1, "Relationship type is required."),
  email: z.email("Invalid email address.").optional().or(z.literal("")),
  phone: z.string().optional(),
});
type ContactFormValues = z.infer<typeof contactSchema>;

const noteSchema = z.object({
  noteTitle: z.string().min(1, "Note title is required."),
  noteType: z.string().optional(),
  noteContent: z.string().min(1, "Note content is required."),
});
type NoteFormValues = z.infer<typeof noteSchema>;

const uploadDocumentSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "File is required."),
  documentCategory: z.string().min(1, "Category is required."),
  description: z.string().optional(),
});
type UploadDocumentFormValues = z.infer<typeof uploadDocumentSchema>;

const ClientDetailPage = () => {
  const { id } = useParams();
  const clientId = Number(id);

  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [contacts, setContacts] = useState<ClientContact[]>([]);
  const {
    register: registerContact,
    handleSubmit: handleSubmitContact,
    reset: resetContactForm,
    formState: { errors: contactErrors, isSubmitting: addingContact },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { contactName: "", relationshipType: "", email: "", phone: "" },
  });

  const [notes, setNotes] = useState<ClientNote[]>([]);
  const {
    register: registerNote,
    handleSubmit: handleSubmitNote,
    control: noteControl,
    reset: resetNoteForm,
    formState: { errors: noteErrors, isSubmitting: addingNote },
  } = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: { noteTitle: "", noteType: "", noteContent: "" },
  });

  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const {
    register: registerUpload,
    handleSubmit: handleSubmitUpload,
    control: uploadControl,
    reset: resetUploadForm,
    formState: { errors: uploadErrors, isSubmitting: uploading },
  } = useForm<UploadDocumentFormValues>({
    resolver: zodResolver(uploadDocumentSchema),
    defaultValues: { documentCategory: "Client ID", description: "" },
  });

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const result = await getClientById(clientId);
        setClient(result);
      } catch {
        setError(`Failed to load the detail page of client id:${clientId}.`);
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [clientId]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const result = await getClientContacts(clientId);
        setContacts(result);
      } catch {
        // Failure to load contacts does not affect the display of the main details page
      }
    };
    fetchContacts();
  }, [clientId]);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const result = await getClientNotes(clientId);
        setNotes(result);
      } catch {
        // Failure to load notes does not affect the display of the main details page
      }
    };
    fetchNotes();
  }, [clientId]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const result = await getClientDocuments(clientId);
        setDocuments(result);
      } catch {
        // Failure to load documents does not affect the display of the main details page
      }
    };
    fetchDocuments();
  }, [clientId]);

  const onSubmitContact = async (values: ContactFormValues) => {
    try {
      await createClientContact(clientId, {
        contactName: values.contactName,
        relationshipType: values.relationshipType,
        email: values.email || undefined,
        phone: values.phone || undefined,
      });

      const result = await getClientContacts(clientId);
      setContacts(result);
      toast.success("Contact added.");
      resetContactForm({ contactName: "", relationshipType: "", email: "", phone: "" });
    } catch {
      toast.error("Failed to add contact.");
    }
  };

  const handleDeactivateContact = async (contactId: number) => {
    try {
      await deactivateClientContact(clientId, contactId);
      const result = await getClientContacts(clientId);
      setContacts(result);
      toast.success("Contact deactivated.");
    } catch {
      toast.error("Failed to deactivate contact.");
    }
  };

  const onSubmitNote = async (values: NoteFormValues) => {
    try {
      await createClientNote(clientId, {
        noteTitle: values.noteTitle,
        noteContent: values.noteContent,
        noteType: values.noteType || undefined,
      });

      const result = await getClientNotes(clientId);
      setNotes(result);
      toast.success("Note added.");
      resetNoteForm({ noteTitle: "", noteType: "", noteContent: "" });
    } catch {
      toast.error("Failed to add note.");
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      await deleteClientNote(clientId, noteId);
      const result = await getClientNotes(clientId);
      setNotes(result);
      toast.success("Note deleted.");
    } catch {
      toast.error("Failed to delete note.");
    }
  };

  const onSubmitUpload = async (values: UploadDocumentFormValues) => {
    try {
      await uploadClientDocument(
        clientId,
        values.file[0],
        values.documentCategory,
        values.description ?? ""
      );
      const refreshedDocs = await getClientDocuments(clientId);
      setDocuments(refreshedDocs);
      toast.success("Document uploaded.");
      resetUploadForm({ documentCategory: "Client ID", description: "" });
    } catch {
      toast.error("Failed to upload document.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
        <AlertTriangle className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" size="sm" render={<Link to="/clients" />}>
          <ArrowLeft />
          Back to Clients
        </Button>
      </div>
    );
  }
  if (!client) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button variant="ghost" size="sm" render={<Link to="/clients" />}>
            <ArrowLeft />
            Back to Clients
          </Button>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {client.clientName}
            </h1>
            <ClientStatusBadge status={client.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {client.clientCode} · {client.clientType}
          </p>
        </div>
        <Button variant="outline" render={<Link to={`/clients/${client.clientId}/edit`} />}>
          <Pencil />
          Edit
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Email</dt>
              <dd className="text-sm">{client.email ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Phone</dt>
              <dd className="text-sm">{client.phone ?? "-"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm text-muted-foreground">Address</dt>
              <dd className="text-sm">
                {[
                  client.addressLine1,
                  client.addressLine2,
                  client.city,
                  client.state,
                  client.postcode,
                  client.country,
                ]
                  .filter(Boolean)
                  .join(", ") || "-"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm text-muted-foreground">Internal Notes</dt>
              <dd className="text-sm">{client.internalNotesSummary ?? "-"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Related Contacts */}
      <Card>
        <CardHeader>
          <CardTitle>Related Contacts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {contacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No contacts yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Relationship</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact) => (
                    <TableRow key={contact.clientContactId}>
                      <TableCell>{contact.contactName}</TableCell>
                      <TableCell>{contact.relationshipType}</TableCell>
                      <TableCell>{contact.email ?? "-"}</TableCell>
                      <TableCell>{contact.phone ?? "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            handleDeactivateContact(contact.clientContactId)
                          }
                        >
                          Deactivate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <Separator />
          <h3 className="text-sm font-medium">Add Contact</h3>
          <form onSubmit={handleSubmitContact(onSubmitContact)}>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="contactName">Contact Name</FieldLabel>
                  <Input
                    id="contactName"
                    aria-invalid={!!contactErrors.contactName}
                    {...registerContact("contactName")}
                  />
                  <FieldError
                    errors={
                      contactErrors.contactName ? [contactErrors.contactName] : undefined
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="relationshipType">
                    Relationship Type
                  </FieldLabel>
                  <Input
                    id="relationshipType"
                    aria-invalid={!!contactErrors.relationshipType}
                    {...registerContact("relationshipType")}
                  />
                  <FieldError
                    errors={
                      contactErrors.relationshipType
                        ? [contactErrors.relationshipType]
                        : undefined
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="contactEmail">Email</FieldLabel>
                  <Input
                    id="contactEmail"
                    type="email"
                    aria-invalid={!!contactErrors.email}
                    {...registerContact("email")}
                  />
                  <FieldError
                    errors={contactErrors.email ? [contactErrors.email] : undefined}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="contactPhone">Phone</FieldLabel>
                  <Input id="contactPhone" {...registerContact("phone")} />
                </Field>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={addingContact}>
                  {addingContact ? "Adding..." : "Add Contact"}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {notes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notes yet.</p>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div key={note.clientNoteId} className="rounded-md border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-medium">{note.noteTitle}</h4>
                    <div className="flex items-center gap-2">
                      {note.noteType && <Badge variant="outline">{note.noteType}</Badge>}
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon-sm"
                        aria-label="Delete note"
                        onClick={() => handleDeleteNote(note.clientNoteId)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {note.noteContent}
                  </p>
                </div>
              ))}
            </div>
          )}

          <Separator />
          <h3 className="text-sm font-medium">Add Note</h3>
          <form onSubmit={handleSubmitNote(onSubmitNote)}>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="noteTitle">Note Title</FieldLabel>
                  <Input
                    id="noteTitle"
                    aria-invalid={!!noteErrors.noteTitle}
                    {...registerNote("noteTitle")}
                  />
                  <FieldError
                    errors={noteErrors.noteTitle ? [noteErrors.noteTitle] : undefined}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="noteType">Note Type</FieldLabel>
                  <Controller
                    control={noteControl}
                    name="noteType"
                    render={({ field }) => (
                      <Select value={field.value ?? ""} onValueChange={field.onChange}>
                        <SelectTrigger id="noteType" className="w-full">
                          <SelectValue placeholder="-- None --" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="File Note">File Note</SelectItem>
                          <SelectItem value="Client Call">Client Call</SelectItem>
                          <SelectItem value="Meeting Note">Meeting Note</SelectItem>
                          <SelectItem value="Internal Update">Internal Update</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="noteContent">Note Content</FieldLabel>
                <Textarea
                  id="noteContent"
                  aria-invalid={!!noteErrors.noteContent}
                  {...registerNote("noteContent")}
                />
                <FieldError
                  errors={noteErrors.noteContent ? [noteErrors.noteContent] : undefined}
                />
              </Field>
              <div className="flex justify-end">
                <Button type="submit" disabled={addingNote}>
                  {addingNote ? "Adding..." : "Add Note"}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded At</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.documentId}>
                      <TableCell>{doc.originalFileName}</TableCell>
                      <TableCell>{doc.documentCategory}</TableCell>
                      <TableCell>{doc.description ?? "-"}</TableCell>
                      <TableCell>{(doc.fileSizeBytes / 1024).toFixed(1)} KB</TableCell>
                      <TableCell>
                        {new Date(doc.uploadedAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            downloadDocument(doc.documentId, doc.originalFileName)
                          }
                        >
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <Separator />
          <h3 className="text-sm font-medium">Upload Document</h3>
          <form onSubmit={handleSubmitUpload(onSubmitUpload)}>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="uploadFile">File</FieldLabel>
                  <Input
                    id="uploadFile"
                    type="file"
                    aria-invalid={!!uploadErrors.file}
                    {...registerUpload("file")}
                  />
                  <FieldError
                    errors={
                      uploadErrors.file
                        ? [{ message: uploadErrors.file.message }]
                        : undefined
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="uploadCategory">Category</FieldLabel>
                  <Controller
                    control={uploadControl}
                    name="documentCategory"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="uploadCategory" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Client ID">Client ID</SelectItem>
                          <SelectItem value="Engagement Documents">Engagement Documents</SelectItem>
                          <SelectItem value="Correspondence">Correspondence</SelectItem>
                          <SelectItem value="Internal Draft">Internal Draft</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="uploadDescription">Description</FieldLabel>
                <Textarea id="uploadDescription" {...registerUpload("description")} />
              </Field>
              <div className="flex justify-end">
                <Button type="submit" disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDetailPage;