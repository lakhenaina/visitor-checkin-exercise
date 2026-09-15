
export const initialForm = { full_name: "", company_name: "", host_id: "", purpose: "" };

// Allows letters + spaces + optional apostrophe/dash.
export const FULL_NAME_REGEX = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;
