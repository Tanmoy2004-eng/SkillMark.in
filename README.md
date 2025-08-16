# SkillMark (CSV-backed Orders)

This project contains a simple frontend + Node/Express backend that saves orders into a CSV file and lets users track them.

## Structure
```
SkillMark/
├── backend/
│   ├── server.js
│   ├── orders.csv        # auto-populated
│   └── package.json
└── frontend/
    ├── index.html
    ├── style.css
    └── script.js
```

## Run Backend
```bash
cd backend
npm install
npm start
```
The API runs at `http://localhost:5000`.

## Use Frontend
Open `frontend/index.html` in your browser (just double-click).  
If your browser blocks API calls (CORS/local-file), run a tiny static server:
```bash
# Option A (Node)
npx http-server ./frontend -p 8080

# Option B (Python 3)
cd frontend
python -m http.server 8080
```
Then visit `http://localhost:8080`.

## Endpoints
- `POST /orders`  
  Body JSON:
  ```json
  {
    "name": "Alice",
    "email": "alice@mail.com",
    "phone": "9999999999",
    "whatsapp": "9999999999",
    "paymentMethod": "qr",
    "certificateType": "B.Tech Certificate",
    "amount": "699"
  }
  ```
  Returns: `{ "message": "...", "orderId": "ED2025xxxxxx", "status": "Order Placed" }`

- `GET /orders/:orderId`  
  Returns the stored row for that order.

## Notes
- Orders are saved to `backend/orders.csv`. Keep the file; the backend appends new rows.
- You can safely deploy the backend anywhere (Render, Railway, VPS). Just update `API_BASE` in `frontend/script.js`.
- Admin login is not implemented here, but the backend is ready to extend.
