async function run_hello() {
    const response = await fetch("/api/hello");
    const res = await response.json();

    document.getElementById("hello_test").innerHTML = res;
}

run_hello();
