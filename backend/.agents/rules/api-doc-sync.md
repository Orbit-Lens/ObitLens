# API & Documentation Synchronization Rule

## Rule Overview
Every API endpoint modification (addition, update, schema change, or deletion) in `backend/web-backend` or `backend/processing-service` must immediately trigger:
1. An update to the master documentation [`backend/BACKEND_DEVELOPER_GUIDE.md`](file:///c:/Users/SAKTHIVEL%20%20P/Desktop/SIH2026/Orbit_Lens/backend/BACKEND_DEVELOPER_GUIDE.md).
2. A re-sync of the Postman Collection in workspace `Orbit_Lens` using `postman-mcp-server`.
