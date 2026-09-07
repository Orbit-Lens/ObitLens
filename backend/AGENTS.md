# 📜 OrbitLens Backend Agent Rules & Guidelines

## 🔄 Mandatory API & Documentation Synchronization Rule

Whenever any modification, addition, refactoring, or deletion is made to backend APIs, route definitions, schemas, or controllers in `web-backend/` or `processing-service/`, the agent **MUST** automatically perform the following two synchronization steps:

---

### 1. Update `backend/BACKEND_DEVELOPER_GUIDE.md`
- **Location:** [`backend/BACKEND_DEVELOPER_GUIDE.md`](file:///c:/Users/SAKTHIVEL%20%20P/Desktop/SIH2026/Orbit_Lens/backend/BACKEND_DEVELOPER_GUIDE.md)
- **Actions Required:**
  - Update or add the endpoint definition under the appropriate Category section.
  - Document the updated HTTP Method, Path, Authentication requirements, and Headers.
  - Provide updated JSON Request Body and Response examples.
  - Document all relevant action scenarios: **Success (200/201)**, **Change/Update (200)**, **Discard/Delete (200/404)**, **Approve/Confirm (200)**, and **Error (400/401/403/409/429/500/503)**.
  - Update the Status Codes & Action Matrix table if any new status code or error code is introduced.

---

### 2. Synchronize Postman API Collection
- **Target Workspace:** `Orbit_Lens` (`df9582ff-bff2-4183-b241-c80b9fc975de`)
- **Actions Required:**
  - Execute the `orbitlens-postman-sync` skill workflow or call `postman-mcp-server` `createCollection` tool.
  - Ensure the updated endpoint, request body schema, and headers are synced into the corresponding category folder in Postman.
