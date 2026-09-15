import { useState, useEffect } from "react";
import { createVisitor, searchVisitors, getHosts } from "./api";

const initialForm = { full_name: "", company_name: "", host_id: "", purpose: "" };

// Allows letters + spaces + optional apostrophe/dash.
const FULL_NAME_REGEX = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;

export default function RegistrationForm({ onRegistered, onError }) {
  const [form, setForm] = useState(initialForm);
  const [hosts, setHosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getHosts().then((data) => {
      if (data) setHosts(data);
    });
  }, []);

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

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));

    if (name === "full_name") {
      const trimmed = value.trim();

      if (trimmed.length >= 2 && FULL_NAME_REGEX.test(trimmed)) {
        searchVisitors(trimmed).then((data) => {
          if (data) setSuggestions(data);
        });
      } else {
        setSuggestions([]);
      }
    }
  }

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

      setErrors(validateForm(next));
      return next;
    });

    setSuggestions([]);
  }

 async function handleSubmit(e) {
  e.preventDefault();

  const nextErrors = validateForm(form);
  setErrors(nextErrors);

  if (Object.keys(nextErrors).length > 0) {
    const firstField = Object.keys(nextErrors)[0];
    const el = document.querySelector(`[name="${firstField}"]`);
    if (el) el.focus();
    return;
  }

  try {
    await createVisitor({ ...form, host_id: form.host_id || null });

    setForm(initialForm);
    setSuggestions([]);
    setErrors({});
    onRegistered();
  } catch (err) {
    // ✅ show error toast if API fails
    onError?.("Registration failed. Please try again.");
  }
}

  /* ---------- UI ONLY BELOW ---------- */

  return (
    <div style={styles.card} id="register">
      <div style={styles.cardHead}>
        <span>👤</span>
        <h3 style={styles.cardTitle}>Register a Visitor</h3>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div style={styles.grid}>
          {/* Full Name */}
          <div style={styles.field}>
            <label style={styles.label}>
              Full Name <span style={styles.req}>*</span>
            </label>
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              autoComplete="off"
              placeholder="Enter visitor's full name"
              style={styles.input(!!errors.full_name)}
            />
            {errors.full_name && <div style={styles.errorText}>{errors.full_name}</div>}

            {suggestions.length > 0 && (
              <ul style={styles.dropdown}>
                {suggestions.map((s) => (
                  <li
                    key={s.id}
                    style={styles.dropdownItem}
                    onClick={() => fillFromSuggestion(s)}
                  >
                    {s.full_name} — {s.company_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Company */}
          <div style={styles.field}>
            <label style={styles.label}>Company</label>
            <input
              name="company_name"
              value={form.company_name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter company name"
              style={styles.input(false)}
            />
          </div>

          {/* Host */}
          <div style={styles.field}>
            <label style={styles.label}>
              Host <span style={styles.req}>*</span>
            </label>
            <select
              name="host_id"
              value={form.host_id}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              style={styles.input(!!errors.host_id)}
            >
              <option value="">Select host…</option>
              {hosts.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
            {errors.host_id && <div style={styles.errorText}>{errors.host_id}</div>}
          </div>

          {/* Purpose (full width, like "Additional Note" in the design) */}
          <div style={{ ...styles.field, ...styles.fullWidth }}>
            <label style={styles.label}>Purpose</label>
            <textarea
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={3}
              placeholder="Purpose of visit…"
              style={{ ...styles.input(false), resize: "vertical" }}
            />
          </div>
        </div>

        <div style={styles.actions}>
          <button type="submit" style={styles.primaryBtn}>
            ⊕ Register Visitor
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 1px 3px rgba(16,24,40,0.08)",
    padding: "20px 22px",
    marginBottom: "24px",
  },
  cardHead: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" },
  cardTitle: { margin: 0, fontSize: "15px", fontWeight: 600, color: "#111827" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px" },
  field: { position: "relative" },
  fullWidth: { gridColumn: "1 / -1" },
  label: { display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "6px" },
  req: { color: "#ef4444" },
  input: (hasError) => ({
    width: "100%",
    padding: "9px 12px",
    fontSize: "14px",
    borderRadius: "6px",
    border: `1px solid ${hasError ? "#ef4444" : "#d1d5db"}`,
    outline: "none",
    boxSizing: "border-box",
    background: "#fff",
    color: "#111827",
    fontFamily: "inherit",
  }),
  errorText: { color: "#ef4444", fontSize: "12px", marginTop: "4px" },
  actions: { display: "flex", justifyContent: "flex-end", marginTop: "18px" },
  primaryBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "9px 18px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    boxShadow: "0 8px 20px rgba(16,24,40,0.12)",
    listStyle: "none",
    margin: "4px 0 0",
    padding: "4px",
    zIndex: 10,
    maxHeight: "220px",
    overflowY: "auto",
  },
  dropdownItem: { padding: "8px 10px", cursor: "pointer", borderRadius: "4px", fontSize: "14px" },
};