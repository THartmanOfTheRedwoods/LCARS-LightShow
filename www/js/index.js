let selectedPicker = null;
// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener("deviceready", function(event) {
  //Many browsers won't play this next sound because the user hasn't "blessed" the action with a UI click yet.
  lcarsAudio.Ready();
  attachConfig();
  attachNavigation();
  attachPresetControls();
  attachColorPickerControls();
}, false);

function attachConfig() {
  const configInputs = document.querySelectorAll("#configfrm .lcars-text-input");
  configInputs.forEach( input => {
    input.value = window.localStorage.getItem(input.id);
    input.addEventListener("focusout", e => {
      window.localStorage.setItem(e.target.id, e.target.value);
    });
  });
}

function attachNavigation() {
  const navbuttons = document.querySelectorAll("#left-menu .button");
  navbuttons.forEach( btn => btn.addEventListener("click", e => {
    // Alternate method: e.target.getAttribute("data-page");
    navigate("#" + e.target.dataset.page);
  }));
}

function getDeviceUrl() {
    const deviceip = document.querySelector("#deviceip");
    const deviceport = document.querySelector("#deviceport");
    // Make sure we have a device host and port configured.
    if( deviceip.value === "" ) {
      alert("A Device IP is required");
      return null;
    }
    // Create our REST interface URL
    const uri = "https://" + deviceip.value + ((deviceport.value !== "") ? ":" + deviceport.value : "") +"/devices/process";
    console.log("Returning: " + uri);
    return uri;
}

function buildUriAndFetch(uri, method="GET", data=null) {  // Later make this a general routing function for GET, POST, PUT and DELETE
    if(!uri) { return false; }

    // Define our fetch parameters like method and body.
    fetchOptions = { "method": method };
    fetchOptions["headers"] = {
      'Accept': 'application/json'
    };
    if(data !== null) {
      fetchOptions["headers"]["Content-Type"] = 'application/json';
      fetchOptions["body"] = JSON.stringify(data);
    }
    // Make request
    fetch(uri, fetchOptions).then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to process request.');
      }
    }).then(data => {
      // Handle the response data (Device object) as needed
      console.log('Response from request:', data);
    })
    .catch(error => {
      // Handle any errors
      console.error('Error:', error);
    });
}

function attachPresetControls() {
  const presetbuttons = document.querySelectorAll("#presets .button");
  presetbuttons.forEach(btn => btn.addEventListener("click", e => {
    const data = {
      "deviceName": document.querySelector("#device").value,
      "deviceCommand": e.target.dataset.route,
      "commandParameters": {}
    };
    buildUriAndFetch(getDeviceUrl(), "POST", data);
  }));
}

function attachColorPickerControls() {
  // Set the default picker to brightness control.
  selectedPicker = document.querySelector("#pickerWhite");

  document.querySelector("#xy_ctl_up").addEventListener("click", function(){
    selectedPicker = document.querySelector("#pickerWhite");
  });
  document.querySelector("#xy_ctl_down").addEventListener("click", function(){
    selectedPicker = document.querySelector("#pickerBlue");
  });
  document.querySelector("#xy_ctl_left").addEventListener("click", function(){
    selectedPicker = document.querySelector("#pickerRed");
  });
  document.querySelector("#xy_ctl_right").addEventListener("click", function(){
    selectedPicker = document.querySelector("#pickerGreen");
  });
  document.querySelector("#xy_ctl_NE").addEventListener("click", function() {
    const val = parseInt(selectedPicker.value);
    const step = parseInt(selectedPicker.getAttribute("step"));
    selectedPicker.value = val + step;
  });
  document.querySelector("#xy_ctl_NW").addEventListener("click", function() {
    const val = parseInt(selectedPicker.value);
    const step = parseInt(selectedPicker.getAttribute("step"));
    selectedPicker.value = val - step;
  });
  document.querySelector("#transmitBtn").addEventListener("click", e => {
    const transmit = e.target;
    const frm = transmit.closest('form');
    const data = {
      "deviceName": document.querySelector("#device").value,
      "deviceCommand": e.target.dataset.route,
      "commandParameters": {
        red: frm.pickerRed.value,
        green: frm.pickerGreen.value,
        blue: frm.pickerBlue.value
      }
    };
    buildUriAndFetch(getDeviceUrl(), "POST", data);
  });
}

function navigate(page) {
  const pg = document.querySelector(page);
  if(pg) { // Only navigate if page content exists.
      const pages = document.querySelectorAll("#container .content");
      pages.forEach( p => {
        p.classList.remove("active");
      });
      pg.classList.add("active");
  }
}

//Cosmetic-ish behavior: scroll to gets hidden by top row body frame, so we need to scroll back slighly to have the actual heading element for each section visible after an in-page navigation.
function locationHashChanged() {
    if (location.hash.substr(-8) == "_section") {
        console.info("in-page nav detected.");
        setTimeout(function(){window.scrollBy(0,-100)}, 100);
    }
}
window.onhashchange = locationHashChanged;
