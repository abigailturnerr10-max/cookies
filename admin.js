window.addEventListener("load", function () {
  if (localStorage.getItem("isAdmin") === "true") {
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    loadOrders();
  } else {
    document.getElementById("loginScreen").style.display = "flex";
    document.getElementById("dashboard").style.display = "none";
  }
});
window.onload = function () {
  if (localStorage.getItem("isAdmin") === "true") {
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    loadOrders();
  } else {
    showLogin();
  }
};
if (localStorage.getItem("isAdmin") !== "true") {
  showLogin();
}
window.logout = function () {
  localStorage.removeItem("isAdmin");

  document.getElementById("dashboard").style.display = "none";
  document.getElementById("loginScreen").style.display = "flex";
};
{
 document.getElementById("loginScreen").style.display = "flex";
document.getElementById("dashboard").style.display = "none";
}
// ======================
// FIREBASE SETUP
// ======================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB7WgHsNNtNeOB-Yr7l0xeMjhSGY0umtP0",
  authDomain: "cookies-store-5d0b8.firebaseapp.com",
  projectId: "cookies-store-5d0b8",
  storageBucket: "cookies-store-5d0b8.firebasestorage.app",
  messagingSenderId: "412525710610",
  appId: "1:412525710610:web:fdf3921867b89920fdb7cb"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ======================
// LOGIN
// ======================

const correctPassword = "deshious10$";

window.onload = function () {
  showLogin();
};

function showLogin() {
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("loginScreen").style.display = "flex";
}

function checkLogin() {
  const input = document.getElementById("adminPass").value.trim();
  const error = document.getElementById("error");

  if (input === correctPassword) {
    function checkLogin() {
  const input = document.getElementById("adminPass").value.trim();
  const error = document.getElementById("error");

  if (input === correctPassword) {

    // ✅ ADD THIS LINE HERE
    localStorage.setItem("isAdmin", "true");

    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("dashboard").style.display = "block";

    loadOrders();

  } else {
    error.innerText = "Wrong password";
  }
}
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("dashboard").style.display = "block";

    loadOrders();
  } else {
    error.innerText = "Wrong password";
  }
}

// ======================
// LOAD ORDERS (REALTIME)
// ======================

function loadOrders() {
  const container = document.getElementById("orders");
  const ordersRef = collection(db, "orders");

  onSnapshot(ordersRef, (snapshot) => {
    container.innerHTML = "";

    let totalRevenue = 0;
    let processing = 0;
    let orders = [];

    snapshot.forEach((docSnap) => {
      let order = {
        firestoreId: docSnap.id,
        ...docSnap.data()
      };

      orders.push(order);

      totalRevenue += order.total;
      if (order.status === "Processing") processing++;
    });

    orders.forEach((order) => {
      container.innerHTML += `
        <div class="order-card">
          <h3>${order.id}</h3>
          <p>${order.customer.name}</p>
          <p>${order.customer.phone}</p>
          <p>${order.customer.address}</p>
          <p>₦${order.total}</p>
          <p>Status: ${order.status}</p>

          <select onchange="updateStatus('${order.firestoreId}', this.value)">
            <option ${order.status === "Processing" ? "selected" : ""}>Processing</option>
            <option ${order.status === "Shipped" ? "selected" : ""}>Shipped</option>
            <option ${order.status === "Delivered" ? "selected" : ""}>Delivered</option>
          </select>
        </div>
      `;
    });

    document.getElementById("totalOrders").innerText = orders.length;
    document.getElementById("revenue").innerText = "₦" + totalRevenue;
    document.getElementById("pending").innerText = processing;
  });
}

// ======================
// UPDATE STATUS
// ======================

async function updateStatus(orderId, status) {
  const orderRef = doc(db, "orders", orderId);
  await updateDoc(orderRef, { status });
}
// ======================
// MAKE FUNCTIONS GLOBAL
// ======================

window.checkLogin = checkLogin;
window.updateStatus = updateStatus;