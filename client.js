async function signup() {
    const payload = {
        name: document.getElementById("signup-name").value,
        email: document.getElementById("signup-email").value,
        pw_hash: document.getElementById("signup-password").value // matches backend
    };

    const response = await fetch("http://localhost:3001/user/new_account", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    const text = await response.text();

    if (!response.ok) {
        console.error("Signup failed:", text);
        return;
    }

    const res = JSON.parse(text);

    console.log("Created user:", res);

    alert("Account created!");
}

async function login() {
    const payload = {
        username: document.getElementById("login-name").value,
        pw: document.getElementById("login-password").value
    };

    const response = await fetch("http://localhost:3001/user/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    const token = await response.json();

    if (!response.ok) {
        console.error("Login failed:", text);
        alert("Invalid credentials");
        return;
    }


    console.log("token :", token);

    // ✅ store session
    localStorage.setItem("usr_token", token);

    alert("Welcome Back");

    // ✅ load orders immediately
    loadUserOrders();
}

async function loadUserOrders() {
    const token = localStorage.getItem("usr_token");

    if (!token) {
        console.log("No user logged in");
        return;
    }

    const response = await fetch("http://localhost:3001/user/orders", { 
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        }
    });

    const text = await response.text();

    if (!response.ok) {
        console.error("Failed to load orders:", text);
        return;
    }

    const orders = JSON.parse(text);

    console.log("Orders:", orders);

    renderUserOrders(orders);
}

function renderUserOrders(orders) {
    const container = document.getElementById("orders-container");

    container.innerHTML = "";

    if (!orders.length) {
        container.innerHTML = "<p>No orders yet</p>";
        return;
    }

    orders.forEach(order => {
        const div = document.createElement("div");

        div.innerHTML = `
            <h3>Order: ${order.o_pub_id}</h3>
            <p>Vendor: ${order.brand}</p>
            <p>Status: ${order.status}</p>
            <p>Total: ${order.total}</p>

            <button onclick="openPayment('${order.o_pub_id}', '${order.v_pub_id}')">
                Pay
            </button>
        `;

        container.appendChild(div);
    });
}

let currentOrderId = null;

async function openPayment(orderId, vendorId) {
    currentOrderId = orderId;

    const response = await fetch(`http://localhost:3001/order/${vendorId}/gcash`);

    if (!response.ok) {
        console.error("Failed to load GCash QR");
        return;
    }

    const blob = await response.blob();

    const imgUrl = URL.createObjectURL(blob);

    document.getElementById("gcash-img").src = imgUrl;

    document.getElementById("payment-section").style.display = "block";
}

async function submitReceipt() {
    const fileInput = document.getElementById("receipt-input");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
        `http://localhost:3001/order/${currentOrderId}/submit_reciept`,
        {
            method: "POST",
            body: formData
        }
    );

    if (!response.ok) {
        alert("Upload failed");
        return;
    }

    alert("Receipt submitted!");

    // optional refresh
    loadUserOrders();
}

