
async function loadParameters() {
    let res = await fetch(root_url + 'parameters/all');
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
    max_humidity.classList = ["non-editable"];
    max_humidity.disabled = true;

    let night_end_hour = document.getElementById("night_end_hour");
    max_humidity.classList = ["non-editable"];
    max_humidity.disabled = true;

    postForm(root_url + 'parameters/all', {
        max_humidity: max_humidity.value,
        humidity_threshold: humidity_threshold.value,
        night_start_hour: night_start_hour.value,
        night_end_hour: night_end_hour.value
    });
}

function postForm(path, params, method='post') {

    const form = document.createElement('form');
    form.method = method;
    form.action = path;
  
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        const hiddenField = document.createElement('input');
        hiddenField.type = 'hidden';
        hiddenField.name = key;
        hiddenField.value = params[key];
  
        form.appendChild(hiddenField);
      }
    }
  
    document.body.appendChild(form);
    form.submit();
  }