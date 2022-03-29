
async function loadParameters() {
    let res = await fetch(root_url + 'api/parameters/all');
    let parameters = await res.json();
    console.log(parameters);
    document.getElementById("max_humidity").value = parameters.max_humidity;
    document.getElementById("humidity_threshold").value = parameters.humidity_threshold;
    document.getElementById("night_start_hour").value = parameters.night_start_hour;
    document.getElementById("night_end_hour").value = parameters.night_end_hour;
}

async function enterEditMode() {
    console.log("enter edit mode");
    
    let button = document.getElementById("edition-validation");
    button.onclick = confirmEdit;
    button.innerHTML = "Confirm edit";

    // TODO: add a cancel button ?

    let humidity_threshold = document.getElementById("humidity_threshold");
    humidity_threshold.classList = ["editable"];
    humidity_threshold.disabled = false;

    let max_humidity = document.getElementById("max_humidity");
    max_humidity.classList = ["editable"];
    max_humidity.disabled = false;

    let night_start_hour = document.getElementById("night_start_hour");
    night_start_hour.classList = ["editable"];
    night_start_hour.disabled = false;

    let night_end_hour = document.getElementById("night_end_hour");
    night_end_hour.classList = ["editable"];
    night_end_hour.disabled = false;
}

async function confirmEdit() {
    console.log("confirm edit");
    let button = document.getElementById("edition-validation");
    button.onclick = enterEditMode;
    button.innerHTML = "Edit parameters";

    let humidity_threshold = document.getElementById("humidity_threshold");
    humidity_threshold.classList = ["non-editable"];
    humidity_threshold.disabled = true;

    let max_humidity = document.getElementById("max_humidity");
    max_humidity.classList = ["non-editable"];
    max_humidity.disabled = true;

    let night_start_hour = document.getElementById("night_start_hour");
    night_start_hour.classList = ["non-editable"];
    night_start_hour.disabled = true;

    let night_end_hour = document.getElementById("night_end_hour");
    night_end_hour.classList = ["non-editable"];
    night_end_hour.disabled = true;

    let data = {
      max_humidity: max_humidity.value,
      humidity_threshold: humidity_threshold.value,
      night_start_hour: night_start_hour.value,
      night_end_hour: night_end_hour.value
    }

    // post new parameters stored in data
    let res = await fetch(root_url + 'api/parameters/all', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'  
      },
      body: JSON.stringify(data)
    });

    let fetched_parameters = await res.json();
    console.log("fetched: " + fetched_parameters);
}
