async function run_hello() {
    const response = await fetch("http://localhost:3001/hello");
    const res = await response.json();

    document.getElementById("hello_test").innerHTML = res;
}

run_hello();
