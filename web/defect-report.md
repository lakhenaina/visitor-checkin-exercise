# Defect Report - Naina Lakhe

## Defect #1 – Field Validation

**Summary:** Full Name field accepts numbers and special characters  
**Type:** Functional  

### Description
The **Full Name** input field in the visitor registration form does not validate input properly. It allows users to enter numbers (0-9) and special characters (`!@#$%^&*`, etc.), which are not valid characters for a person’s name.

### Steps to Reproduce
1. Navigate to the visitor registration form.
2. Click on the **Full Name** input field.
3. Enter a name with numbers (e.g., `John123`).
4. Enter a name with special characters (e.g., `Jane@#$`).
5. Attempt to submit the form.

### Expected Result
The form should display a validation error message indicating that the **Full Name** field should only contain alphabetic characters and spaces. The form should not submit until valid input is provided.

### Actual Result
The form accepts numbers and special characters in the **Full Name** field without any validation error and allows form submission with invalid data.

## Defect #2— Missing Validation Error Messages
**Summary:** User can submit an empty form without seeing required-field error messages  
**Type:** Functional / Validation  

### Description
The visitor registration form allows submission even when required fields are left blank. The UI does not display clear validation error messages to indicate which fields are mandatory, resulting in invalid or incomplete submissions.

### Steps to Reproduce
1. Navigate to the visitor registration form.
2. Leave all fields empty
3. Click the **Submit** button.

### Expected Result
- The form should not submit.
- Required fields should display clear validation error messages (e.g., “Full Name is   required”, “Select at least one host”, etc.).
- Optionally, focus should move to the first invalid field and/or an inline/summary error should be shown.

### Actual Result
The form submits (or proceeds) even when required fields are empty, and no (or insufficient) validation error messages are displayed.

## Defect #3 — New Visitor Added to End of Paginated List (Not Immediately Visible)

**Summary:** Newly created visitors appear on the last page instead of the first page  
**Type:** Usability  

### Description
When a new visitor is successfully registered, the visitor entry is added to the end of the list and appears on the last page of the paginated visitor list. This forces users to navigate through multiple pages to verify the new entry, resulting in a poor user experience.

### Steps to Reproduce
1. Navigate to the visitor registration form.
2. Fill in all required fields with valid data.
3. Click the **Submit** button.
4. Observe the visitor list after successful submission.
5. Check which page displays the newly created visitor.

### Expected Result
The newly created visitor should appear at the top of the visitor list on the first page, **or** the application should automatically navigate to the page containing the new entry with clear visual feedback (e.g., highlight).

### Actual Result
The newly created visitor is added to the end of the list and appears on the last page. Users must manually navigate through pagination to find the newly created entry.

## Defect #4— Asia/Kathmandu Timezone Offset Not Applied Correctly

**Summary:** Incorrect timezone handling for Asia/Kathmandu  
**Type:** Data / Functional  

### Description
The application does not properly handle the `Asia/Kathmandu` timezone. Time-related data may display incorrectly or use a different timezone than expected.

### Steps to Reproduce
1. Navigate to the visitor list.
2. Create a new visitor entry.
3. Observe the timestamp in the **checkIn** column for the created entry.
4. Compare the displayed time with the current `Asia/Kathmandu` time (UTC+5:45).
5. Verify whether the UTC+5:45 offset is correctly applied.

### Expected Result
All timestamps should accurately reflect the `Asia/Kathmandu` timezone (UTC+5:45). The displayed time should match the local time in Nepal.

### Actual Result
Timestamps are displayed in a different timezone or the `Asia/Kathmandu` offset is not applied correctly, leading to time **mismatches**.

## Defect #5 — Missing Loading Indicator While Fetching Visitor List

**Summary:** No loading indicator shown while visitor list data is fetching  
**Type:** Usability / Functional  

### Description
When the Visitor Check-in page loads, visitor data appears after a noticeable delay. During this time, the UI does not show any loading state. This makes the table area appear empty and can confuse users into thinking the app is not working or that there are no visitors.

### Steps to Reproduce
1. Open the application and observe the **Active Visitors** table.
2. Open **Developer Tools → Network** tab.
3. Set network throttling to **Slow 3G** (or any slower profile).
4. Refresh the page.
5. Observe the **Active Visitors** table area while the `GET /visitors?page=1` request is still in progress.

### Expected Result
While visitors are being fetched, the UI should display a clear loading state for the visitor list (e.g., loader/spinner or “Loading visitors…”). The table should not appear empty without context.

### Actual Result
No loading UI is shown while the API request is in progress. The table content appears late, and the table area looks empty/unchanged until data arrives.

## Defect #6 — Missing Empty State UI for No Search Results

**Summary:** No empty state message when search returns 0 visitors  
**Type:** Usability / Functional  

### Description
When a user searches for a keyword that matches no visitors, the Active Visitors list shows no rows but does not display an empty state message. This can confuse users and makes it unclear whether the search worked or the list failed to load.

### Steps to Reproduce
1. Go to the **Active Visitors** list.
2. In the search input (name/host), enter a keyword that matches nothing (e.g., `zzzzzzzz`).
3. Observe the table/list results.

### Expected Result
If there are 0 matching visitors, the UI should display a clear empty state, e.g.:
- **“No visitors found”**
- Optional: **“Clear search”** button/action

### Actual Result
The list/table appears empty with no explanatory message or action (no “No visitors found” empty state).

## Defect #7 — Autocomplete Dropdown Does Not Close on Outside Click

**Summary:** Full Name suggestions dropdown remains visible after clicking outside  
**Type:** Usability / UI

### Description
When the user types into the **Full Name** field, an autocomplete suggestions dropdown appears. If the user clicks outside the input/dropdown (e.g., clicks on **Company**, **Host**, **Purpose**, or any blank area), the dropdown remains open instead of closing. This can overlap other inputs and makes the UI feel stuck.

### Steps to Reproduce
1. Navigate to the **Register a Visitor** form.
2. Click the **Full Name** field.
3. Type at least 2 letters (e.g., `Naina`) so the suggestions dropdown appears.
4. Click outside the dropdown/input (e.g., click the **Company** field).

### Expected Result
The suggestions dropdown should close when:
- the input loses focus, or
- the user clicks outside the input/dropdown area.

### Actual Result
The suggestions dropdown stays open until the user selects a suggestion or clears/edits the input, even after clicking elsewhere.

## Defect #8 — Error messages are not shown when the server (API) fails

**Type:** Usability / Functional

### Description 
When the frontend (the user interface) fails to connect to the backend (Rails server), nothing happens on the screen. The user receives no warning or explanation. The system fails silently, leaving the user confused about whether their action worked or not.

### Steps to Reproduce
1. Start the frontend without the Rails API, or make the API unavailable.
2. Open the visitor application.
3. Attempt to load visitors or register a visitor.

### Expected Result
A clear, friendly error message should appear on the screen (for example: "Unable to connect to the server. Please check your connection and try again.").

### Actual Result
Nothing happens, the table stays empty. The error only appears in the hidden developer console.
