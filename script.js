// ======================
// FIREBASE SETUP
// ======================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp 
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
// INIT
// ======================

function init() {
  loadCart();
  updateCartCount();
}

document.addEventListener("DOMContentLoaded", init);
window.addEventListener("pageshow", init);

// ======================
// CART SYSTEM
// ======================

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function addToCart(name, price, button) {
  let cart = getCart();

  cart.push({ name, price });

  localStorage.setItem("cart", JSON.stringify(cart));

  if (button) {
    button.innerText = "Added ✓";

    setTimeout(() => {
      button.innerText = "Add to Cart";
    }, 1500);
  }

  updateCartCount();
  loadCart();
}

// ======================
// CART COUNT
// ======================

function updateCartCount() {
  let cart = getCart();
  let count = document.getElementById("cart-count");

  if (count) {
    count.innerText = cart.length;
  }
}

// ======================
// LOAD CART
// ======================

function loadCart() {
  let cart = getCart();
  let container = document.getElementById("cart");

  if (!container) return;

  container.innerHTML = "";

  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;

    container.innerHTML += `
      <div class="cart-item">
        <p>${item.name}</p>
        <span>₦${item.price.toLocaleString()}</span>
        <button onclick="removeItem(${index})">×</button>
      </div>
    `;
  });

  let totalBox = document.getElementById("total");
  if (totalBox) {
    totalBox.innerText = "Total: ₦" + total.toLocaleString();
  }
}

// ======================
// REMOVE ITEM
// ======================

function removeItem(index) {
  let cart = getCart();

  cart.splice(index, 1);

  localStorage.setItem("cart", JSON.stringify(cart));

  loadCart();
  updateCartCount();
}

// ======================
// SAVE ORDER (FIRESTORE)
// ======================

async function saveOrder(order) {
  try {
    const docRef = await addDoc(collection(db, "orders"), {
      ...order,
      createdAt: serverTimestamp()
    });

    console.log("Order saved:", docRef.id);

    localStorage.setItem("lastOrder", JSON.stringify({
      ...order,
      firestoreId: docRef.id
    }));

  } catch (error) {
    console.error("Error saving order:", error);
  }
}

// ======================
// VALIDATION
// ======================

function validateCheckout() {
  let name = document.getElementById("name").value.trim();
  let email = document.getElementById("email").value.trim();
  let phone = document.getElementById("phone").value.trim();
  let address = document.getElementById("address").value.trim();

  if (!name || !email || !phone || !address) {
    alert("Please fill all delivery details");
    return false;
  }

  return { name, email, phone, address };
}

// ======================
// PAYMENT
// ======================

function payWithflutterwave() {
  let cart = getCart();

  if (cart.length === 0) {
    alert("Your cart is empty");
    return;
  }

  let customer = validateCheckout();
  if (!customer) return;

  let total = 0;
  cart.forEach(item => (total += item.price));

  let orderId = "ORDER-" + Date.now();

  let order = {
    id: orderId,
    items: cart,
    total: total,
    status: "Processing",
    date: new Date().toISOString(),
    customer: customer
  };

  FlutterwaveCheckout({
  public_key: "FLWPUBK_TEST-00b16bbc2b335bd8668054a497ca10da-X",
  tx_ref: orderId,
  amount: total,
  currency: "NGN",
  payment_options: "card, transfer, ussd",

  customer: {
    email: customer.email,
    phone_number: customer.phone,
    name: customer.name
  },

  customizations: {
    title: "Cookies Store",
    description: "Order Payment"
  },

  callback: async function (response) {

    // ✅ Only save if payment is successful
    if (response.status === "successful") {

      await saveOrder(order);

      localStorage.setItem("lastOrder", JSON.stringify(order));
      localStorage.removeItem("cart");

      window.location.href = "success.html";

    } else {
      alert("Payment failed");
    }
  },

  onclose: function () {
    alert("Payment cancelled");
  }
});
}
function copyOrderId() {
  let order = JSON.parse(localStorage.getItem("lastOrder"));

  if (!order) return;

  navigator.clipboard.writeText(order.id).then(() => {
    alert("Tracking ID copied ✔");
  }).catch(() => {
    alert("Copy failed");
  });
}
window.addToCart = addToCart;
window.removeItem = removeItem;
window.payWithflutterwave = payWithflutterwave;
