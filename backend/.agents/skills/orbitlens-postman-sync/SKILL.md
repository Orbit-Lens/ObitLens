---
name: orbitlens-postman-sync
description: >-
  Sync or generate the OrbitLens Web Backend category-wise API collection
  with full request bodies, headers, and authorization in Postman workspace 'Orbit_Lens'.
  Use this skill whenever the user requests updating, refreshing, or creating Postman collections for OrbitLens.
---

# OrbitLens Postman Collection Sync Skill

This skill automates the creation and synchronization of the category-wise Postman API collection for **OrbitLens Web Backend** inside the **`Orbit_Lens`** workspace in Postman using the `postman-mcp-server` tools.

## Target Postman Workspace
- **Workspace Name:** `Orbit_Lens`
- **Workspace ID:** `df9582ff-bff2-4183-b241-c80b9fc975de`

## Workflow & Execution Steps

### 1. Fetch & Verify Workspace
Call `postman-mcp-server` `getWorkspaces` to verify access to workspace `Orbit_Lens`. If the workspace ID is unknown, resolve it from the workspace named `Orbit_Lens`.

### 2. Base Configuration & Variables
Ensure the collection defines standard environment variables:
- `baseUrl`: `http://localhost:5000` (Default API server address)
- `token`: (JWT Access Token for Bearer Authentication)

### 3. API Categories & Route Mapping

The collection must group endpoints into the following 8 categories:

#### Category 1: System & Health
- `GET {{baseUrl}}/health` — Liveness Probe
- `GET {{baseUrl}}/ready` — Readiness Probe (Checks MongoDB, Redis, Processing Service)

#### Category 2: Auth
- `POST {{baseUrl}}/api/v1/auth/register` — Register User (Body: `name`, `email`, `password`, `role`)
- `POST {{baseUrl}}/api/v1/auth/login` — Login User (Body: `email`, `password`)
- `POST {{baseUrl}}/api/v1/auth/refresh` — Refresh Access Token
- `POST {{baseUrl}}/api/v1/auth/logout` — Logout User *(Bearer Auth)*

#### Category 3: Users
- `GET {{baseUrl}}/api/v1/users/me` — Get Profile *(Bearer Auth)*
- `PUT {{baseUrl}}/api/v1/users/me` — Update Profile *(Bearer Auth, Body: `name`)*
- `GET {{baseUrl}}/api/v1/users/me/export` — Export Data *(Bearer Auth)*
- `DELETE {{baseUrl}}/api/v1/users/me` — Delete Account *(Bearer Auth, Body: `confirmation`)*

#### Category 4: Projects
- `POST {{baseUrl}}/api/v1/projects` — Create Project *(Bearer Auth, Body: `name`, `description`, `tags`)*
- `GET {{baseUrl}}/api/v1/projects` — Get All Projects *(Bearer Auth)*
- `GET {{baseUrl}}/api/v1/projects/:id` — Get Project by ID *(Bearer Auth)*
- `PUT {{baseUrl}}/api/v1/projects/:id` — Update Project *(Bearer Auth, Body: `name`, `description`, `tags`)*
- `DELETE {{baseUrl}}/api/v1/projects/:id` — Delete Project *(Bearer Auth)*

#### Category 5: Images
- `POST {{baseUrl}}/api/v1/images/upload-url` — Request S3 Upload Presigned URL *(Bearer Auth, Body: metadata)*
- `POST {{baseUrl}}/api/v1/images/:id/confirm` — Confirm S3 Upload *(Bearer Auth, Body: file metrics)*
- `GET {{baseUrl}}/api/v1/images` — Get All Images *(Bearer Auth)*
- `GET {{baseUrl}}/api/v1/images/:id` — Get Image Metadata *(Bearer Auth)*
- `GET {{baseUrl}}/api/v1/images/:id/download-url` — Get Presigned Download URL *(Bearer Auth)*
- `PUT {{baseUrl}}/api/v1/images/:id` — Update Image Metadata *(Bearer Auth, Body)*
- `DELETE {{baseUrl}}/api/v1/images/:id` — Delete Image *(Bearer Auth)*

#### Category 6: Jobs
- `POST {{baseUrl}}/api/v1/jobs` — Create Registration Job *(Bearer Auth, Body: `sourceImageId`, `referenceImageId`, `algorithm`, `transformModel`, `parameters`)*
- `GET {{baseUrl}}/api/v1/jobs` — Get All Jobs *(Bearer Auth)*
- `GET {{baseUrl}}/api/v1/jobs/:id` — Get Job Status *(Bearer Auth)*
- `GET {{baseUrl}}/api/v1/jobs/:id/metrics` — Get Registration Metrics *(Bearer Auth)*
- `GET {{baseUrl}}/api/v1/jobs/:id/artifacts` — Get Artifact Download URLs *(Bearer Auth)*
- `DELETE {{baseUrl}}/api/v1/jobs/:id` — Cancel / Delete Job *(Bearer Auth)*
- `POST {{baseUrl}}/api/v1/jobs/:id/status-internal` — Internal Processing Callback *(Header `X-Internal-Key`, Body: status & metrics)*

#### Category 7: Metrics
- `GET {{baseUrl}}/api/v1/metrics/overview` — Get Metrics Overview *(Bearer Auth)*

#### Category 8: Contact
- `POST {{baseUrl}}/api/v1/contact` — Submit Contact Message *(Public, Body: `name`, `email`, `subject`, `message`)*
- `GET {{baseUrl}}/api/v1/contact` — View Contact Messages *(Bearer Auth)*

### 4. Collection Execution
Use `postman-mcp-server` `createCollection` tool with:
- `workspace`: `df9582ff-bff2-4183-b241-c80b9fc975de`
- `collection`: Postman Collection v2.1 JSON structure with items, bodies, headers, and variables.

### 5. Verification
Verify that the response returns the `collection.id` and `collection.name`. Report the updated status to the user.
