import { useState, useEffect } from "react";
import { createVisitor, searchVisitors, getHosts } from "./api";

export default function RegistrationForm({ onRegistered }) {
  const [form, setForm] = useState({
    full_name: "",
    company_name: "",
    host_id: "",
    purpose: "",
  });

  const [hosts, setHosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  // NEW: store validation errors (right now we only use full_name, but scalable)
  const [errors, setErrors] = useState({ full_name: "" });

  useEffect(() => {
    getHosts().then((data) => {
      if (data) setHosts(data);
    });
  }, []);

  // NEW: validation function for full name
  function validateFullName(value) {
    const trimmed = value.trim();

    // required check (because field has *)
    if (!trimmed) return "Full Name is required.";

    // letters + spaces only
    // This allows: "John", "John Doe", "Mary Jane"
    // Disallows numbers and special chars
    const nameRegex = /^[A-Za-z]+(?:\s+[A-Za-z]+)*$/;
    if (!nameRegex.test(trimmed)) {
      return "Only alphabets are allowed.";
    }

    return ""; // no error
  }

  function handleChange(e) {
    const { name, value } = e.target;

    // Keep existing behavior: update form state
    setForm((f) => ({ ...f, [name]: value }));

    // NEW: validate full_name on every change and show error message
    if (name === "full_name") {
      const message = validateFullName(value);
      setErrors((prev) => ({ ...prev, full_name: message }));

      // UPDATED: only search if there is no validation error AND length >= 2
      if (message === "" && value.trim().length >= 2) {
        searchVisitors(value).then((data) => {
          if (data) setSuggestions(data);
        });
      } else {
        setSuggestions([]);
      }

      return; // exit early since we handled full_name logic
    }

    // Keep your original non-full_name behavior (nothing else needed here)
  }

  function fillFromSuggestion(s) {
    setForm((f) => ({
      ...f,
      full_name: s.full_name,
      company_name: s.company_name || f.company_name,
      host_id: s.host_id ? String(s.host_id) : f.host_id,
    }));

    // NEW: re-validate when we auto-fill the name
    setErrors((prev) => ({ ...prev, full_name: validateFullName(s.full_name) }));

    setSuggestions([]);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // NEW: validate before submitting
    const fullNameError = validateFullName(form.full_name);
    if (fullNameError) {
      setErrors((prev) => ({ ...prev, full_name: fullNameError }));
      return; // stop submission
    }

    await createVisitor({ ...form, host_id: form.host_id || null });

    setForm({ full_name: "", company_name: "", host_id: "", purpose: "" });
    setSuggestions([]);

    // NEW: clear errors when resetting
    setErrors({ full_name: "" });

    onRegistered();
  }

  return (
    <div style={{ marginBottom: "24px" }}>
      <h2>Register Visitor</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ position: "relative", marginBottom: "8px" }}>
          <label>
            Full Name *<br />
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              required
              autoComplete="off"
              style={{
                width: "260px",
                // NEW: red border when invalid
                border: errors.full_name ? "1px solid red" : "1px solid #ccc",
              }}
              // NEW: helps browser/assistive tech understand it is invalid
              aria-invalid={Boolean(errors.full_name)}
              aria-describedby="full-name-error"
            />
          </label>

          {/* NEW: error message shown under input */}
          {errors.full_name && (
            <div
              id="full-name-error"
              style={{ color: "red", fontSize: "12px", marginTop: "4px" }}
            >
              {errors.full_name}
            </div>
          )}

          {suggestions.length > 0 && (
            <ul style={dropdownStyle}>
              {suggestions.map((s) => (
                <li
                  key={s.id}
                  style={{ padding: "6px 8px", cursor: "pointer" }}
                  onClick={() => fillFromSuggestion(s)}
                >
                  {s.full_name} — {s.company_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ marginBottom: "8px" }}>
          <label>
            Company<br />
            <input
              name="company_name"
              value={form.company_name}
              onChange={handleChange}
              style={{ width: "260px" }}
            />
          </label>
        </div>

        <div style={{ marginBottom: "8px" }}>
          <label>
            Host *<br />
            <select
              name="host_id"
              value={form.host_id}
              onChange={handleChange}
              required
              style={{ width: "268px" }}
            >
              <option value="">Select host…</option>
              {hosts.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div style={{ marginBottom: "8px" }}>
          <label>
            Purpose<br />
            <textarea
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
              rows={3}
              style={{ width: "260px" }}
            />
          </label>
        </div>

        {/* Optional: disable submit if name invalid */}
        <button type="submit" disabled={Boolean(errors.full_name)}>
          Submit
        </button>
      </form>
    </div>
  );
}

const dropdownStyle = {
  position: "absolute",
  top: "100%",
  left: 0,
  background: "#fff",
  border: "1px solid #ccc",
  listStyle: "none",
  margin: 0,
  padding: 0,
  width: "260px",
  zIndex: 10,
};