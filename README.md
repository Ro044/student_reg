# Student Registration System

A fully responsive single-page web application for managing student records, built with **HTML, CSS, and vanilla JavaScript** — no frameworks, no build tools, no backend.
Users can register students, view them in a scrollable table, edit existing records, and delete entries. All data persists in the browser via `localStorage` and survives page refreshes.

---

## Features

- **Add** new student records via a validated form.
- **View** all registered students in a responsive, scrollable table with a live record count.
- **Edit** existing records (form repopulates and switches to update mode).
- **Delete** records with a confirmation prompt.
- **Persistent storage** — records survive a browser refresh (`localStorage`).
- **Inline form validation** with real-time error messages:
  - Name → letters and spaces only
  - Student ID → numeric only (must be unique)
  - Email → valid email format
  - Contact Number → digits only, minimum **10 digits**
- **Empty submissions blocked** — cannot add a blank record.
- **Dynamic vertical scrollbar** — appears only when row count exceeds the threshold (controlled by JavaScript).
- **Fully responsive** across **mobile (≤ 640px)**, **tablet (641–1024px)**, and **desktop (≥ 1025px)**.
- **XSS protection** — user input is escaped before being rendered to the DOM.

---

## Project Structure

A flat, organized layout — no nested folders.

```
student_reg/
├── index.html      # HTML structure & form (Tasks 1–4)
├── style.css       # Styling and responsive layout (Task 5)
├── script.js       # CRUD logic, validation, persistence (Task 6)
└── README.md       # Project documentation (Task 7)
```

---

## How to Run

1. Download or clone the repository.
   ```bash
   git clone <repository-url>
   cd student_reg
   ```
2. Open `index.html` in any modern web browser. No server, no build step, no installation needed.

---

## Task Mapping

| Task | Description | File(s) |
|------|-------------|---------|
| 1. Basic Structure | HTML5 skeleton with meta tags & meaningful title | `index.html` (head) |
| 2. Header | Catchy title + tagline | `index.html` (`.hero`), `style.css` |
| 3. Form & Inputs | Form with name, ID, email, contact fields | `index.html` (`.form-card`), `style.css` |
| 4. Display Section | Responsive scrollable table for records | `index.html` (`.records-card`), `style.css` |
| 5. Styling & Design | CSS theme tokens, animations, three responsive breakpoints | `style.css` |
| 6. JavaScript | CRUD operations, validation, localStorage, dynamic scrollbar | `script.js` |
| 7. Documentation | Comments, organized structure, README | All files |

---

## Validation Rules

| Field          | Rule                                       | Regex                              |
|----------------|--------------------------------------------|------------------------------------|
| Student Name   | Letters and spaces only                    | `/^[A-Za-z\s]+$/`                  |
| Student ID     | Numeric only, must be unique               | `/^\d+$/`                          |
| Email          | Valid email format                         | `/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/`  |
| Contact Number | Digits only, **at least 10 digits**        | `/^\d{10,}$/`                      |

Empty submissions are blocked, and duplicate Student IDs are rejected with a clear error.

---

## Responsive Breakpoints

| Device  | Range          | Behavior                                                |
|---------|----------------|---------------------------------------------------------|
| Mobile  | ≤ 640px        | Stacked layout, compact padding, full-width buttons     |
| Tablet  | 641 – 1024px   | Stacked layout with reduced padding                     |
| Desktop | ≥ 1025px       | Two-column dashboard (form + table side-by-side)        |

---

## How It Works

1. On page load, `script.js` reads any existing records from `localStorage` (`studentRegistry` key) and renders them into the table.
2. Submitting the form runs all four field validators; failures highlight inputs in red and show inline error messages.
3. A valid submission is pushed into the `students` array, persisted with `localStorage.setItem`, and the table is re-rendered.
4. Clicking **Edit** loads the row's values into the form and toggles the primary button to **Update Student**.
5. Clicking **Delete** triggers `confirm()` before removing the record from the array and storage.
6. After every render, `updateScrollbar()` checks whether the row count exceeds the threshold and dynamically applies `max-height` + `overflow-y: auto` to the table wrapper.


## Author

Developed as a student project to demonstrate the use of **HTML, CSS, and JavaScript** for full client-side CRUD operations.

## License

Open-source and free to use for educational purposes.
