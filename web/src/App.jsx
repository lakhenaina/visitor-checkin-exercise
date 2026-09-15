import { useState } from "react";
import RegistrationForm from "./RegistrationForm";
import VisitorList from "./VisitorList";

function App() {
  const [refresh, setRefresh] = useState(0);

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "24px" }}>
      <h1>Visitor Check-in</h1>
      <RegistrationForm onRegistered={() => setRefresh((r) => r + 1)} />
      <VisitorList onRefresh={refresh} />
    </div>
  );
}

export default App;