import { useState, useEffect } from "react";
import { getIntakes, type IntakeListItem } from "../services/intakeService";
import { Link } from "react-router-dom";

const IntakesPage = () => {
  const [intakes, setIntakes] = useState<IntakeListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIntake = async () => {
      try {
        const result = await getIntakes({ page: 1, pageSize: 20 });
        setIntakes(result.items);
        setTotalCount(result.totalCount);
      } catch {
        setError("Load intakes information failed");
      } finally {
        setLoading(false);
      }
    };
    fetchIntake();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Intakes</h1>
      <p>Total: {totalCount}</p>
      <Link to="/intakes/create">Create Intake</Link>

      <table>
        <thead>
          <tr>
            <th>Intake Code</th>
            <th>Prospective Client</th>
            <th>Practice Area</th>
            <th>Assigned Reviewer</th>
            <th>Status</th>
            <th>Urgency</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {intakes.map((intake) => (
            <tr key={intake.intakeId}>
              <td>
                <Link to={`/intakes/${intake.intakeId}`}>
                  {intake.intakeCode}
                </Link>
              </td>
              <td>{intake.prospectiveClientName}</td>
              <td>{intake.practiceAreaName}</td>
              <td>{intake.assignedReviewer}</td>
              <td>{intake.status}</td>
              <td>{intake.urgency}</td>
              <td>{intake.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IntakesPage;
