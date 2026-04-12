async function createVendor() {
    const payload = {
        name: document.getElementById("name").value,
        pw: document.getElementById("pw").value,
        email: document.getElementById("email").value,
        bw_rate: parseFloat(document.getElementById("bw_rate").value),
        clrd_rate: parseFloat(document.getElementById("clrd_rate").value),
        lat: parseFloat(document.getElementById("lat").value),
        long: parseFloat(document.getElementById("long").value),
        brand: document.getElementById("brand").value
    };

    console.log("Payload:", payload); // debug

    const response = await fetch("http://localhost:3001/vendor/new", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (response.ok) {
        alert("Vendor created!");
    } else {
        const err = await response.text();
        console.error("Error:", err);
        alert("Failed to create vendor");
    }
}
