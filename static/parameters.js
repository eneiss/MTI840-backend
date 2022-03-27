
async function loadParameters() {
    let res = await fetch(root_url + 'parameters/all');
    let parameters = await res.json();
    console.log(parameters);
    document.getElementById("max_humidity").innerHTML = parameters.max_humidity + "%";
    document.getElementById("humidity_threshold").innerHTML = parameters.humidity_threshold + "%";
}