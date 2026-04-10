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

async function createOrder() {
    const copies = parseInt(document.getElementById("copies").value);
    const print_size = document.getElementById("print-size").value;
    const total = parseFloat(document.getElementById("total").value);

    const vendor = localStorage.getItem("selected_vendor");
    const file = localStorage.getItem("uploaded_file");

    const user = "test_USR_001";

const color = document.getElementById("color").value; // "color" or "bw"
const colorValue = color === "color"; //

    const payload = { copies, print_size, color: colorValue, file, total, vendor, user };

    const response = await fetch("http://localhost:3001/order/createorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    alert("Order created successfully!");
}

get_vendors();


