# API routes

- `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET|POST /api/donations`
- `POST /api/ai-search`
- `POST /api/matches/:id/accept`
- `POST /api/rescues/:id/pickup`, `POST /api/rescues/:id/deliver`
- `GET|PUT /api/organizations/profile`
- `GET|PUT /api/organizations/needs`
- `GET /api/organizations/dashboard`
- `GET /api/organizations/nearby?latitude=&longitude=&radius=&query=`
- `GET /api/statistics/overview?range=`, `GET /api/statistics/trends?range=`, `GET /api/statistics/categories?range=`
- `GET /api/statistics/organization/:id`
- `GET /api/admin`, `PATCH /api/admin/users/:id/status`, `PATCH /api/admin/organizations/:id`

Private routes return `401` without a valid session and `403` when the role or ownership check fails. Validation errors return `400`; duplicate emails return `409`.
