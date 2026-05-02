async function get_vendors() { 
    const vendors = await fetch("http://localhost:3001/order/listvendors");
    const vendors_res = await vendors.json();

    const container = document.getElementById("vendor-list");
    vendors_res.forEach(vendor => {
        const div = document.createElement("div");
        div.innerHTML = `
            <h3>${vendor.brand}</h3>
            <p>Email: ${vendor.email}</p>
            <p>B/W Rate: ${vendor.bw_rate}</p>
            <p>Color Rate: ${vendor.clrd_rate}</p>
            <p>Location(lat): ${vendor.lat}<p>
            <p>Location(long): ${vendor.long}</p>
            <p>Status: ${vendor.availability}</p>

            <button onclick="selectVendor('${vendor.pub_id}')">
                Select Vendor
            </button>
            `;

        container.appendChild(div);

console.log(vendors_res);
    });
}

async function selectVendor(pub_id) {
    const response = await fetch("http://localhost:3001/order/choosevendor", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ pub_id })
    });

    const res = await response.json();
    console.log("Selected:", res);

    // Store selected vendor (important)
    localStorage.setItem("selected_vendor", pub_id);

    // Move to next step
    showUploadSection();
}

function showUploadSection() {
    const section = document.getElementById("upload-section");
    if (section) section.style.display = "block";
}

async function uploadFile() {
    const fileInput = document.getElementById("file-input");
    const file = fileInput.files[0];

    const vendor = localStorage.getItem("selected_vendor");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("vendor_id", vendor);

    const response = await fetch("http://localhost:3001/order/attachfile", {
        method: "POST",
        body: formData
    });

    const res = await response.json();
    
    localStorage.setItem("uploaded_file", res); // or whatever your backend returns
    
    console.log(res);

    showOrderSection();
}

function showOrderSection() {
    document.getElementById("order-section").style.display = "block";
}

async function review_order() {
    const vendor = localStorage.getItem("selected_vendor");
    const copies = parseInt(document.getElementById("copies").value);
    const print_size = document.getElementById("print-size").value;

    
    const color = document.getElementById("color").value;
    const colorValue = color === "color";

    const order_data = { copies, vendor ,color: colorValue };

    const totalRes = await fetch("http://localhost:3001/order/total", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(order_data)
    });

    if (!totalRes.ok) {
        console.error("Failed to fetch total");
        return;
    }

    const totalData = await totalRes.json();

    const container = document.getElementById("review-order");

        container.innerHTML = `
            <h3> Order Details </h3>
            <p> copies: ${copies} </p>
            <p> shop: ${vendor} </p>
            <p> colored: ${colorValue} </p>
            <p> size: ${print_size} </p>
            <p> total: ${totalData} </p>
            <button id="confirm-order">Continue</button>
        `;

        
    document.getElementById("confirm-order").addEventListener("click", () => {
        createOrder(vendor, copies, print_size, colorValue, totalData);
    });
}

async function createOrder(vendor, copies, print_size, colorValue, totalData) {
    const token = localStorage.getItem("usr_token");
    
    const file = localStorage.getItem("uploaded_file");

    const payload = { 
        copies, 
        print_size, 
        color: colorValue, 
        file, 
        total: totalData, 
        vendor
    };

    await fetch("http://localhost:3001/order/createorder", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify(payload)
    });

    alert("Order created successfully!");
}

get_vendors();
