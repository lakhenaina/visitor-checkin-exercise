import { useState } from "react";
import RegistrationForm from "./RegistrationForm";
import VisitorList from "./VisitorList";
import Toast from "./Toast";

function App() {
  const [refresh, setRefresh] = useState(0);

 const [toast, setToast] = useState({ open: false, type: "success", message: "" });

  // Helper so both components can trigger toast
  function showToast(type, message) {
    setToast({ open: true, type, message });
  }

  return (
    <>
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "24px" }}>
        <h1>Visitor Check-in</h1>
        <RegistrationForm
          onRegistered={() => {
            setRefresh((r) => r + 1);
            showToast("success", "Visitor Registered Successfully.");
          }}
          onError={(msg) => showToast("error", msg)}
        />

        {/*pass toast handler to VisitorList */}
        <VisitorList onRefresh={refresh} onToast={showToast} />
      </div>

      <Toast
        open={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </>
  );
}

export default App;