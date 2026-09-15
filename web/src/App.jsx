import { useState } from "react";
import RegistrationForm from "./RegistrationForm";
import VisitorList from "./VisitorList";
import Layout from "./Layout";

function App() {
  const [refresh, setRefresh] = useState(0);

  return (
    <Layout>
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "24px" }}>
        <RegistrationForm onRegistered={() => setRefresh((r) => r + 1)} />
        <VisitorList onRefresh={refresh} />
      </div>
    </Layout>
  );
}

export default App;