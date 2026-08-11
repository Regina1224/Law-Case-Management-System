import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { PracticeAreaDto } from "../services/practiceAreaService";
import practiceAreaService from "../services/practiceAreaService";

const AdminPage = () => {
    const [practiceAreas, setPracticeAreas] = useState<PracticeAreaDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(()=>{
        const fetchData = async () => {
            try{
                const response = await practiceAreaService.getAll();
                setPracticeAreas(response.data.data);
                setLoading(false);
            } catch {
                setError('Failed to load practice areas');
                setLoading(false);

            }
        };
        fetchData();
    }, []);

    const handleDelete = async (id: number) => {
        try{
            await practiceAreaService.delete(id);   
            setPracticeAreas(prev=>prev.filter(pa=>pa.id !== id));
            } catch {
                setError('Failed to delete');
                setLoading(false);

            }
    };
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return(
        <div>
            <Link to="/admin/users">Application Users</Link>
            <h1>Reference Data - Practice Areas</h1>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Code</th>
                        <th>Display Order</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {practiceAreas.map(pa => (
                        <tr key={pa.id}>
                            <td>{pa.name}</td>
                            <td>{pa.code}</td>
                            <td>{pa.displayOrder}</td>
                            <td>
                                <button onClick={()=>handleDelete(pa.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default AdminPage;