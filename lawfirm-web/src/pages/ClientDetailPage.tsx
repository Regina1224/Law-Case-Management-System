import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getClientById, type ClientDetail } from "../services/clientService";

const ClientDetailPage = () => {
  const { id } = useParams();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClient = async() => {
        try{
            const result = await getClientById(Number(id));
            setClient(result);
        } catch {
            setError(`Failed to load the detail page of client id:${id}.`);
        } finally {
            setLoading(false);

        }
    }
    fetchClient();
    // TODO 1: 定义一个内部async函数（比如 fetchClient），
    //   调用 getClientById(Number(id))
    //   成功：setClient(结果)
    //   用 try/catch/finally，catch里setError一段提示，finally里setLoading(false)
    //   最后调用这个函数
    // 提示：这次useEffect的依赖数组要写 [id]，不是空数组 []
    //   因为如果用户从一个详情页跳到另一个详情页（比如/clients/1 -> /clients/2），
    //   id变了但组件本身没有重新mount，所以需要显式告诉React"id变了就重新拉取数据"
    

  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!client) return null; // TypeScript需要这一行来确认下面client不是null

  return (
    <div>
      <Link to="/clients">← Back to Clients</Link>
      <h1>{client.clientName}</h1>
      <p>Client Code: {client.clientCode}</p>
      <p>Type: {client.clientType}</p>
      <p>Status: {client.status}</p>
      <p>Email: {client.email}</p>
      <p>Phone: {client.phone}</p>
      <p>Address: {client.addressLine1}, {client.city}, {client.state} {client.postcode}</p>
      <p>Notes: {client.internalNotesSummary}</p>
    </div>
  );
};

export default ClientDetailPage;