// script.js - frontend interactions + API calls
// -------------------------------------------------------------
// Adjust the API_BASE if your backend runs on a different host/port
const API_BASE = 'http://localhost:5000';

// Show order form and prepare QR based on selected product/amount
function showOrderForm(certType, amount) {
  document.getElementById('certificateType').value = certType;
  document.getElementById('certificateAmount').value = amount;
  document.getElementById('orderTitle').textContent = `Order ${certType}`;

  // Generate payment QR dynamically with amount
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=paytmqr1uqkkvekn7@paytm&pn=EdCert%20Solutions&am=${amount}&cu=INR`;
  document.getElementById('qrCodeImage').src = qr;
  document.getElementById('qrCodeText').textContent = `Scan this QR code to make payment of ₹${amount}`;

  document.getElementById('orderSection').classList.remove('hidden');
  window.scrollTo({ top: document.getElementById('orderSection').offsetTop - 20, behavior: 'smooth' });
}

// Toggle payment method UI
function selectPayment(method) {
  const qrContainer = document.getElementById('qrContainer');
  const pmEls = document.querySelectorAll('.payment-method');
  pmEls.forEach(el => el.classList.remove('selected'));

  if (method === 'qr') {
    qrContainer.classList.remove('hidden');
    pmEls[0]?.classList.add('selected');
  } else {
    qrContainer.classList.add('hidden');
    pmEls[1]?.classList.add('selected');
  }
}

// Submit order -> POST /orders
document.getElementById('orderForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const payload = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    whatsapp: document.getElementById('whatsapp').value.trim(),
    paymentMethod: document.querySelector('input[name="payment"]:checked').value,
    certificateType: document.getElementById('certificateType').value,
    amount: document.getElementById('certificateAmount').value
  };

  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Failed to place order');

    alert(`Order placed successfully! Your order ID is ${data.orderId}`);

    // Reset and hide form
    this.reset();
    document.getElementById('orderSection').classList.add('hidden');
  } catch (err) {
    alert(err.message || 'Network error');
  }
});

// Track order -> GET /orders/:id
async function trackOrder() {
  const id = document.getElementById('orderId').value.trim();
  if (!id) return alert('Please enter your Order ID');

  try {
    const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(id)}`);
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Order not found');

    // Fill UI
    document.getElementById('displayOrderId').textContent = data.orderId;
    document.getElementById('displayCertType').textContent = data.certificateType;
    document.getElementById('displayStatus').textContent = data.status;
    document.getElementById('trackResult').classList.remove('hidden');
  } catch (err) {
    alert(err.message || 'Network error');
  }
}

// Initialize default state
selectPayment('qr');
