async function vendorLogin() {
    const payload = {
        username: document.getElementById("username").value,
        pw: document.getElementById("password").value
    };

    const response = await fetch("http://localhost:3001/vendor/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    // IMPORTANT: avoid .json() crashes if backend ever changes
    const text = await response.text();

    if (!response.ok) {
        console.error("Login failed:", text);
        alert("Invalid credentials");
        return;
    }

    // backend returns raw JSON string like: "test_VND_001"
    const pub_id = JSON.parse(text);

    console.log("Logged in vendor:", pub_id);

    // store session (MVP approach)
    localStorage.setItem("vendor_id", pub_id);

    alert("Login successful!");
    loadVendorHome();
}

async function loadVendorHome() {
    const vendorId = localStorage.getItem("vendor_id");

    if (!vendorId) {
        alert("No vendor logged in");
        return;
    }

    const response = await fetch(`http://localhost:3001/vendor/${vendorId}/home`);

    const text = await response.text();

    if (!response.ok) {
        console.error("Failed to load home:", text);
        return;
    }

    const data = JSON.parse(text);

    console.log("Vendor home:", data);

    renderVendorHome(data);
}

function renderVendorHome(data) {
    const container = document.getElementById("vendor-home");

    container.innerHTML = "";

    if (!data.length) {
        container.innerHTML = "<p>No data found</p>";
        return;
    }

    const vendor = data[0]; // since it's 1 vendor

    container.innerHTML = `
        <h3>Vendor Dashboard</h3>
        <p>Latitude: ${vendor.lat}</p>
        <p>Longitude: ${vendor.long}</p>
    `;
}

let ordersVisible = false;

async function toggleOrders() {
    const container = document.getElementById("orders-container");

    ordersVisible = !ordersVisible;

    if (!ordersVisible) {
        container.style.display = "none";
        return;
    }

    container.style.display = "block";

    await loadOrders();
}

async function loadOrders() {
    const vendorId = localStorage.getItem("vendor_id");

    if (!vendorId) return;

    const response = await fetch(`http://localhost:3001/vendor/${vendorId}/orders`);

    const text = await response.text();

    if (!response.ok) {
        console.error("Failed:", text);
        return;
    }

    const orders = JSON.parse(text);

    renderOrders(orders);
}

function renderOrders(orders) {
    const container = document.getElementById("orders-container");

    container.innerHTML = "";

    if (!orders.length) {
        container.innerHTML = "<p>No pending orders</p>";
        return;
    }

    orders.forEach(order => {
        const div = document.createElement("div");

        div.innerHTML = `
            <h3>Order: ${order.pub_id}</h3>
            <p>User: ${order.name}</p>
            <p>Copies: ${order.copies}</p>
            <p>Size: ${order.print_size}</p>
            <p>Color: ${order.color}</p>
            <p>Total: ${order.total}</p>
            <p>Status: ${order.status}</p>
            <p>File: ${order.file_path}</p>

            <button onclick="acceptOrder('${order.pub_id}')">
                Accept
            </button>

            <button onclick="rejectOrder('${order.pub_id}')">
                Reject
            </button>
        `;

        container.appendChild(div);
    });
}

async function acceptOrder(pub_id) {
    const response = await fetch("http://localhost:3001/vendor/accept", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(pub_id)     
    });

    const text = await response.text();

    if (!response.ok) {
        console.error("Accept failed:", text);
        return;
    }

    console.log("Accepted:", text);

    loadOrders();
}

async function rejectOrder(pub_id) {
    const response = await fetch("http://localhost:3001/vendor/reject", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(pub_id)     
    });

    const text = await response.text();

    if (!response.ok) {
        console.error("Reject failed:", text);
        return;
    }

    console.log("Rejected:", text);

    loadOrders();
}

let handlingVisible = false;

async function toggleHandlingOrders() {
    const container = document.getElementById("handling-container");

    handlingVisible = !handlingVisible;

    if (!handlingVisible) {
        container.style.display = "none";
        return;
    }

    container.style.display = "block";

    await loadHandlingOrders();
}

async function loadHandlingOrders() {
    const vendorId = localStorage.getItem("vendor_id");

    if (!vendorId) return;

    const response = await fetch(`http://localhost:3001/vendor/${vendorId}/handlingorders`);

    const text = await response.text();

    if (!response.ok) {
        console.error("Failed:", text);
        return;
    }

    const orders = JSON.parse(text);

    renderHandlingOrders(orders);
}

function renderHandlingOrders(orders) {
    const container = document.getElementById("handling-container");

    container.innerHTML = "";

    if (!orders.length) {
        container.innerHTML = "<p>No active orders</p>";
        return;
    }

    orders.forEach(order => {
        const div = document.createElement("div");

        div.innerHTML = `
            <h3>Order ${order.pub_id}</h3>
            <p>User: ${order.name}</p>
            <p>Copies: ${order.copies}</p>
            <p>Size: ${order.print_size}</p>
            <p>Total: ${order.total}</p>
            <p>Status: ${order.status}</p>
        `;

        container.appendChild(div);
    });
}
