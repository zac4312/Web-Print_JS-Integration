const vendor_token = localStorage.getItem("vendor_token");

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

    const text = await response.text();

    if (!response.ok) {
        console.error("Login failed:", text);
        alert("Invalid credentials");
        return;
    }

    const token = JSON.parse(text);

    console.log("token:", token);

    localStorage.setItem("vendor_token", token);

    alert("Login successful!");
    loadVendorHome();
}

async function loadVendorHome() {
    const vendor_token = localStorage.getItem("vendor_token");

    if (!vendor_token) {
        alert("No vendor logged in");
        return;
    }

    const response = await fetch("http://localhost:3001/vendor/home", {
        method: "get",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + vendor_token
        }
    });

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

    const vendor = data[0];

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
    const vendor_token = localStorage.getItem("vendor_token");

    if (!vendor_token) return;

    const response = await fetch("http://localhost:3001/vendor/orders", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + vendor_token
        }
    });

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
           
            <button onclick="downloadFile('${order.file_path}', '${order.pub_id}')">
                Download File
            </button>

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

async function see_reciept(pub_id) {
    const response = await fetch(`http://localhost:3001/order/${pub_id}/reciept`);

    if (!response.ok) {
        console.error("Failed to load GCash QR");
        return;
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
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
    const vendor_token = localStorage.getItem("vendor_token");
    if (!vendor_token) return;

    const filter = document.getElementById("order-filter").value;

    let url = "http://localhost:3001/vendor/handling_orders";

    if (filter) {
        url += `?state=${filter}`;
    }

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + vendor_token
        }
    });

    const text = await response.text();

    if (!response.ok) {
        console.error("Failed:", text);
        return;
    }

    const orders = JSON.parse(text);
    renderHandlingOrders(orders);
}

function applyFilter() {
    loadHandlingOrders();
}

async function renderHandlingOrders(orders) {
    const container = document.getElementById("orders-list");
    container.innerHTML = "";

    if (!orders.length) {
        container.innerHTML = "<p> Empty </p>";
        return;
    }

    for (const order of orders) {
        const div = document.createElement("div");

        const imgUrl = await see_reciept(order.pub_id);

        div.innerHTML = `
            <h3>Order ${order.pub_id}</h3>
            <p>User: ${order.name}</p>
            <p>Copies: ${order.copies}</p>
            <p>Size: ${order.print_size}</p>
            <p>Total: ${order.total}</p>
            <p>Status: ${order.status}</p>
            <img src="${imgUrl}" alt="No receipt available" width=200>

            <button onclick="set_paid('${order.pub_id}')">
                Confirm Payment
            </button>

            <button onclick="set_claimed('${order.pub_id}')">
                Claimed 
            </button>

            <button onclick="set_completed('${order.pub_id}')">
                Order Complete
            </button>
        `;

        container.appendChild(div);
    }
}

async function set_paid(pub_id) {
    await fetch("http://localhost:3001/vendor/set_paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(pub_id)
   });
}

async function set_claimed(pub_id) {
    await fetch("http://localhost:3001/vendor/set_claimed", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(pub_id)
   });
}

async function set_completed(pub_id) {
    await fetch("http://localhost:3001/vendor/set_completed", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(pub_id)
   });
}

async function updateAvailability() {
    const vendor_token = localStorage.getItem("vendor_token");

    if (!vendor_token) {
        alert("Not logged in");
        return;
    }

    const selected = document.querySelector('input[name="availability"]:checked');

    if (!selected) {
        alert("Select a status");
        return;
    }

    const value = selected.value;

    const response = await fetch(`http://localhost:3001/vendor/change_status`, {
        method: "POST", // or PATCH (better, but POST is fine for now)
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + vendor_token
        },
        body: JSON.stringify(value) // sending raw string
    });

    const text = await response.text();

    if (!response.ok) {
        console.error("Failed:", text);
        alert("Failed to update");
        return;
    }

    console.log("Updated:", value);
    alert("Availability updated!");
}

async function uploadGcash() {
    const vendor_token = localStorage.getItem("vendor_token");

    if (!vendor_token) {
        alert("Not logged in");
        return;
    }

    const fileInput = document.getElementById("gcash-file");
    const file = fileInput.files[0];

    if (!file) {
        alert("Select a file");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("http://localhost:3001/vendor/add_gcash", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + vendor_token
            },
            body: formData
        }
    );

    const text = await response.text();

    if (!response.ok) {
        console.error("Upload failed:", text);
        return;
    }

    const path = JSON.parse(text);

    console.log("Uploaded:", path);

    alert("GCash QR uploaded!");
}

async function downloadFile(file_path, pub_id) {

    const response = await fetch("http://localhost:3001/vendor/download_file", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + vendor_token
        },
        body: JSON.stringify({
            file_path,
            pub_id
        })
    });

    if (!response.ok) {
        console.error("Download failed");
        return;
    }

    const blob = await response.blob();

    // create download link
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = file_path; // match backend
    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(url);

    console.log(file_path)
}
