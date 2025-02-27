import React, { useState, useEffect } from "react";
import { db } from "./Firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const [acronyms, setAcronyms] = useState([]);
  const [teamData, setTeamData] = useState([]);
  const [recentAcronyms, setRecentAcronyms] = useState([]);

  useEffect(() => {
    // Firestore real-time listener
    const unsubscribe = onSnapshot(collection(db, "acronyms"), (snapshot) => {
      console.log("Firestore updated:", snapshot.docs.map((doc) => doc.data())); // Debugging log
      const loaded = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAcronyms(loaded);
      processTeamData(loaded);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  const processTeamData = (data) => {
    const teamCounts = {};

    data.forEach((item) => {
      const team = item.team || "Unknown";
      teamCounts[team] = (teamCounts[team] || 0) + 1;
    });

    const formattedData = Object.keys(teamCounts).map((key) => ({
      name: key,
      value: teamCounts[key],
    }));

    setTeamData(formattedData);

    // Sort acronyms by createdAt timestamp (most recent first)
    const sortedData = [...data]
      .filter((item) => item.createdAt) // Ignore old entries without timestamps
      .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);

    setRecentAcronyms(sortedData.slice(0, 3)); // Show latest 3 acronyms
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28CFE"];

  return (
    <div className="container mt-4 p-3" style={{ maxWidth: "600px" }}>
      <h5 className="text-center text-muted">Quick Stats</h5>

      {/* Total Acronyms Count */}
      <div className="card text-white bg-success mb-3 text-center p-2">
        <h6>Total Acronyms</h6>
        <h3>{acronyms.length}</h3>
      </div>

      {/* Row for Pie Chart & Recently Added Acronyms */}
      <div className="row">
        {/* Pie Chart Section */}
        <div className="col-md-6">
          <div className="card p-3 shadow-sm">
            <h6 className="text-center text-secondary">Acronyms Per Team</h6>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={teamData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {teamData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recently Added Acronyms Section */}
        <div className="col-md-6">
          <div className="card p-3 shadow-sm">
            <h6 className="text-center text-secondary">Recently Added</h6>
            <ul className="list-group">
              {recentAcronyms.length === 0 ? (
                <li className="list-group-item text-muted text-center">
                  No acronyms added yet
                </li>
              ) : (
                recentAcronyms.map((acr) => (
                  <li key={acr.id} className="list-group-item small">
                    <strong>{acr.id}</strong> - {acr.definition} ({acr.team || "Unknown"})
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;





