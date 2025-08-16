// server.js - SkillMark backend (Express + CSV)
// ----------------------------------------------------
// This backend exposes two endpoints:
//   POST /orders        -> save a new order to orders.csv
//   GET  /orders/:id    -> fetch an order by orderId from orders.csv
// CSV columns: orderId,name,email,phone,whatsapp,paymentMethod,certificateType,amount,status,createdAt
// ----------------------------------------------------

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const { parse } = require('fast-csv'); // ✅ fixed import

const app = express();
const PORT = process.env.PORT || 5000;

// ----- Middleware -----
app.use(cors());                 // allow requests from the frontend
app.use(bodyParser.json());      // parse JSON bodies

// ----- CSV setup -----
const csvFilePath = path.join(__dirname, 'orders.csv');

// Ensure CSV exists with headers (idempotent)
if (!fs.existsSync(csvFilePath)) {
  fs.writeFileSync(
    csvFilePath,
    'orderId,name,email,phone,whatsapp,paymentMethod,certificateType,amount,status,createdAt\n'
  );
}

// Helper: generate readable unique-ish order id
function generateOrderId() {
  const rand = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  const yyyy = new Date().getFullYear();
  return `ED${yyyy}${rand}`; // e.g., ED2025001234
}

// ----- Routes -----

// Health check (optional but handy)
app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'SkillMark API' });
});

// Place Order - saves a row to CSV
app.post('/orders', (req, res) => {
  const { name, email, phone, whatsapp, paymentMethod, certificateType, amount } = req.body || {};

  // Basic validation
  if (!name || !email || !phone || !paymentMethod || !certificateType || amount == null) { // ✅ fixed amount check
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const orderId = generateOrderId();
  const status = 'Order Placed';
  const createdAt = new Date().toISOString();

  // Escape commas by wrapping fields that could contain commas with quotes
  function q(v) {
    if (v === undefined || v === null) return '';
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }

  const row = [
    q(orderId),
    q(name),
    q(email),
    q(phone),
    q(whatsapp || ''),
    q(paymentMethod),
    q(certificateType),
    q(amount),
    q(status),
    q(createdAt)
  ].join(',') + '\n';

  fs.appendFile(csvFilePath, row, (err) => {
    if (err) {
      console.error('Error writing CSV:', err);
      return res.status(500).json({ error: 'Could not save order' });
    }
    return res.json({ message: 'Order placed successfully', orderId, status });
  });
});

// Track Order - returns a single row by orderId
app.get('/orders/:orderId', (req, res) => {
  const orderId = req.params.orderId;
  let found = false;

  fs.createReadStream(csvFilePath)
    .pipe(parse({ headers: true })) // ✅ fixed parse usage
    .on('error', (err) => {
      console.error('CSV read error:', err);
      if (!res.headersSent) res.status(500).json({ error: 'Could not read orders' });
    })
    .on('data', function (row) {
      if (!found && row.orderId === orderId) {
        found = true;
        res.json(row);
        this.pause(); // ✅ stop further processing
      }
    })
    .on('end', () => {
      if (!found && !res.headersSent) res.status(404).json({ error: 'Order not found' });
    });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ SkillMark backend running at http://localhost:${PORT}`);
});
