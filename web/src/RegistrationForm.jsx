import { useState, useEffect } from "react";
import { createVisitor, searchVisitors, getHosts } from "./api";

const initialForm = { full_name: "", company_name: "", host_id: "", purpose: "" };

// Allows letters + spaces + optional apostrophe/dash.
// If you want ONLY letters and spaces, remove ' and - from the regex.
const FULL_NAME_REGEX = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;

export default function RegistrationForm({ onRegistered }) {
  const [form, setForm] = useState(initialForm);
  const [hosts, setHosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  // New: store validation errors here
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getHosts().then((data) => {
      if (data) setHosts(data);
    });
  }, []);

  // Validate a single field and return an error string (or "" if valid)
  function validateField(name, value) {
    if (name === "full_name") {
      const v = value.trim();
      if (!v) return "Full Name is required.";
      if (!FULL_NAME_REGEX.test(v)) return "Full Name can contain only letters.";
      if (v.length < 2) return "Full Name must be at least 2 characters.";
      return "";
    }

    if (name === "host_id") {
      if (!value) return "Please select a host.";
      return "";
    }

    return "";
  }

  // Validate entire form at once
  function validateForm(nextForm) {
    const nextErrors = {};
    const fullNameError = validateField("full_name", nextForm.full_name);
    const hostError = validateField("host_id", nextForm.host_id);

    if (fullNameError) nextErrors.full_name = fullNameError;
    if (hostError) nextErrors.host_id = hostError;

    return nextErrors;
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((f) => {
      const next = { ...f, [name]: value };
      return next;
    });

    // Update error message live for the field being edited
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));

    // Keep suggestions logic, but only search when full_name looks reasonable
    if (name === "full_name") {
      const trimmed = value.trim();

      // If invalid characters are used, do not search and clear suggestions
      if (trimmed.length >= 2 && FULL_NAME_REGEX.test(trimmed)) {
        searchVisitors(trimmed).then((data) => {
          if (data) setSuggestions(data);
        });
      } else {
        setSuggestions([]);
      }
    }
  }

  // Show error when leaving the field (useful if user never types)
  function handleBlur(e) {
    const { name, value } = e.target;
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  }

  function fillFromSuggestion(s) {
    setForm((f) => {
      const next = {
        ...f,
        full_name: s.full_name,
        company_name: s.company_name || f.company_name,
        host_id: s.host_id ? String(s.host_id) : f.host_id,
      };

      // Re-validate after auto-filling
      setErrors(validateForm(next));
      return next;
    });

    setSuggestions([]);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Final validation gate before submitting
    const nextErrors = validateForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      // Optional: move focus to first invalid field
      const firstField = Object.keys(nextErrors)[0];
      const el = document.querySelector(`[name="${firstField}"]`);
      if (el) el.focus();
      return; // Stop submit
    }

    await createVisitor({ ...form, host_id: form.host_id || null });

    setForm(initialForm);
    setSuggestions([]);
    setErrors({});
    onRegistered();
  }

  return (
    <div style={{ marginBottom: "24px" }}>
      <h2>Register Visitor</h2>

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ position: "relative", marginBottom: "8px" }}>
          <label>
            Full Name *<br />
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              autoComplete="off"
              style={{ width: "260px", borderColor: errors.full_name ? "red" : "#ccc" }}
            />
          </label>

          {/* New: inline error message */}
          {errors.full_name && (
            <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
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
              onBlur={handleBlur}
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
              onBlur={handleBlur}
              required
              style={{ width: "268px", borderColor: errors.host_id ? "red" : "#ccc" }}
            >
              <option value="">Select host…</option>
              {hosts.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </label>

          {/* New: inline error message */}
          {errors.host_id && (
            <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
              {errors.host_id}
            </div>
          )}
        </div>

        <div style={{ marginBottom: "8px" }}>
          <label>
            Purpose<br />
            <textarea
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={3}
              style={{ width: "260px" }}
            />
          </label>
        </div>

        <button type="submit">Submit</button>
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