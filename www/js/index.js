let selectedPicker = null;
// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener("deviceready", function(event) {
  //Many browsers won't play this next sound because the user hasn't "blessed" the action with a UI click yet.
  lcarsAudio.Ready();
  attachNavigation();
  attachPresetControls();
  attachColorPickerControls();
}, false);

function attachNavigation() {
  const navbuttons = document.querySelectorAll("#left-menu .button");
  navbuttons.forEach( btn => btn.addEventListener("click", e => {
    // Alternate method: e.target.getAttribute("data-page");
    navigate("#" + e.target.dataset.page);
  }));
}

function buildUriAndFetch(route) {
    const hostip = document.querySelector("#hostip");
    const hostport = document.querySelector("#hostport");
    if( hostip.value === "" ) {
      alert("A host IP is required");
      return;
    }
    const uri = "http://"+hostip.value + ((hostport.value !== "") ? ":" + hostport.value : "") +"/device/"+route;
    console.log("Calling: " + uri);
    /* Make Get Request */
    fetch(uri)
      .then((response) => response.json())
      .then((json) => console.log(json));
}

function attachPresetControls() {
  const presetbuttons = document.querySelectorAll("#presets .button");
  presetbuttons.forEach(btn => btn.addEventListener("click", e => {
    buildUriAndFetch(e.target.dataset.route);
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
  document.querySelector("#transmitBtn").addEventListener("click", function() {
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
