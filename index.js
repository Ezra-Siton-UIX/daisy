/* old form:

https://share.hsforms.com/1aJWzFrXyTB6DCpWaJHpm0A4scxv

*/

/* 
new form

https://share.hsforms.com/1KhadLMqTT7aNm3RUvVDRzg4scxv

*/

/*TOC
      1. SEO EVENTS 
      2. Custom Events
      3. GOOGLE PLACES autocomplete
      4. Hubspot Mapping
      5. Webflow FORM SUBMIT
      6. navigateTo
      7. map_feilds
      8. HELPER FUNCTION
      9. CLICK FUNCTION
      10. Parsley EVENTS (Docs under: https://parsleyjs.org)
      */

/*############## Variables ##############*/

$("body").css("overflow-y", "initial");

const contact_type = $("[contact_type]").attr(
  "contact_type"
); /* other / renter / other */

const places = {
  sublocality_level_1: ["Brooklyn", "The Bronx", "Queens", "Manhattan"],
  cities: ["Jersey City", "Hoboken", "Union City", "Fort Lee", "Edgewater"],
  states: ["Florida"]
};

const $webflow_form = $("form[steps_container]");
//$("[pac_input]").parsley().addError("myError", { message: "missing number" });
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const $sections = $("form [form_step]");
const total_slides = $sections.length;
const $prev = $("[prev]");
const $next = $("[next]");
const $clear_storage_btn = $("[clear_storage]");
const active_button_class = "active";
const landing_page_url = "/get-started";
/* webflow & not stage url */
const production = location.href.includes("daisy") && !urlParams.has("dev");

/* dev mode */

const dev_mode = urlParams.has("dev");
if (production) $("[map]").hide();
if (dev_mode) $("[map]").show();

// Prepare sections by setting the `data-parsley-group` attribute to 'block-0', 'block-1', etc.

$sections.each(function (index, section) {
  $(section)
    .find(":input")
    .attr("data-parsley-group", "block-" + index);
  $(section).find(":input").attr("data-parsley-trigger", "null");
});

$("[pac_input]").attr("data-parsley-trigger", "null");

/* ############################################
          1 of 10  SEO Events 🤠
###############################################*/

const run_event_only_once_values = [];

function push_events_seo(event_name) {
  /* run event only one time per page load */
  if (!run_event_only_once_values.includes(event_name) && !production) {
    run_event_only_once_values.push(event_name);

    //run_event_only_once_values.push(event_name);
    console.log(run_event_only_once_values);
    /* GTM */
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: event_name,
      contact_type: contact_type
    });

    /* hubspot */

    /* GA 4 */

    /* mixPanel */

    /* LuckyOrange */
    if (LO !== null) LO.events.track(event_name);

    console.log(`LO.events.track(${event_name})`);
  } /*end if */
}

/*##################🙂‍↔#########################
                  2 of 10  custom Events
    ####################🙂‍↔##########################*/

function get_event_name() {
  let index = get_curIndex();
  let event_name = $sections.eq(index).attr("data-event");
  return event_name;
}

const slideChange = new Event("slideChange");
const webflow_form_submit = new Event("webflow_form_submit");
const slideNext = new Event("slideNext");
const hubspot_formSubmitted = new Event("hubspot_formSubmitted");

document.addEventListener("slideChange", () => {
  //console.log("The slideChange event was triggered")
});

document.addEventListener("hubspot_formSubmitted", () => {
  //console.log("The slideChange event was triggered");
  push_events_seo("hubspot_formSubmitted");
});

document.addEventListener("slideNext", () => {
  //console.log("The slideNext event was triggered");

  let index = get_curIndex();

  let event_name = get_event_name();
  event_name = "form_step_" + event_name;
  push_events_seo(event_name);

  push_state_on_slide_changed(event_name);

  /*
    $(".class_name").remove();
    $("#map").append(
      `<div style="padding: 10px; background: lightgray" class="class_name"><b>Event Name:</b><p>${event_name}</p></div>`
    );*/
});

/* ############################################
      3 of 10   GOOGLE PLACES autocomplete  🤠
###############################################*/

let google_places_keys = [
  "in_area",
  "locality",
  "administrative_area_level_1",
  "sublocality_level_1",
  "country",
  "postal_code",
  "route",
  "street_number",
  "neighborhood"
];

const google_places_input = document.querySelector("[pac_input]");

/* if the user type address the address is not valid (must select from the dropdown) */
const google_maps_options = {
  componentRestrictions: { country: ["us"] },
  strictBounds: true
};
const autocomplete = new google.maps.places.Autocomplete(
  google_places_input,
  google_maps_options
);

let pac_input_it_typing = false;
/* Click Enter */
$(document).on("keydown", "[pac_input]", function (e) {
  /* show error message if click enter */
  reset_address();
  pac_input_it_typing = true;
});

autocomplete.addListener("place_changed", fillInAddress);

let address1Field;

function initAutocomplete() {
  // Create the autocomplete object, restricting the search predictions to
  // addresses in the US and Canada.
  autocomplete = new google.maps.places.Autocomplete(address1Field, {
    componentRestrictions: { country: ["US"] },
    fields: ["address_components", "geometry"],
    types: ["address"]
  });

  address1Field.focus();
  // When the user selects an address from the drop-down, populate the
  // address fields in the form.
  autocomplete.addListener("place_changed", fillInAddress);
}

function fillInAddress() {
  google_places_keys.forEach((this_value) => {
    // print the current element of the array
    sessionStorageRemoveItem(this_value);
  });

  // Get the place details from the autocomplete object.
  const place = autocomplete.getPlace();
  let address1 = "";
  let postcode = "";
  //document.getElementById("google_maps").reset();

  for (const component of place.address_components) {
    // @ts-ignore remove once typings fixed
    const componentType = component.types[0];
    //console.log(input.value);
    //console.log(componentType);

    switch (componentType) {
      case "sublocality_level_1": {
        /* for new york area - bronx and so on */
        var sublocality_level_1 = `${component.long_name}`;
        setStorageItem("sublocality_level_1", sublocality_level_1);

        /* areas in new york */
        places.sublocality_level_1.forEach(function (this_sublocality_level_1) {
          if (sublocality_level_1 === this_sublocality_level_1)
            setStorageItem("in_area", true);
        });

        break;
      }

      case "street_number": {
        var street_number = `${component.long_name} ${address1}`;
        setStorageItem("street_number", street_number);
        break;
      }

      case "route": {
        address1 += component.long_name;
        setStorageItem("route", address1); /* street name */
        break;
      }

      case "postal_code": {
        postcode = `${component.long_name}${postcode}`;
        setStorageItem("postal_code", postcode); /* postcode */
        break;
      }

      case "postal_code_suffix": {
        let postal_code_suffix = `${postcode}-${component.long_name}`;
        setStorageItem(
          "postal_code_suffix",
          postal_code_suffix
        ); /* postal_code_suffix */
        break;
      }

      case "locality": {
        let city = component.long_name;
        setStorageItem(
          "locality",
          component.long_name
        ); /* miami, vegas and so on */

        places.cities.forEach(function (this_city) {
          if (city === this_city) setStorageItem("in_area", true);
        });
        break;
      }

      case "administrative_area_level_1": {
        let state = component.long_name;
        setStorageItem(
          "administrative_area_level_1",
          component.long_name
        ); /* Florida state for example */

        places.states.forEach(function (this_state, index) {
          if (state === this_state) setStorageItem("in_area", true);
        });
        break;
      }

      case "country":
        setStorageItem("country", component.long_name);
        break;

      case "neighborhood":
        setStorageItem("neighborhood", component.long_name);
        break;

      default:
      //console.log(`Sorry, we are out of ${componentType}.`);
    }
  }
  /* after validation */
  pac_input_it_typing = false;
  $(".parsley-errors-list").css("opacity", 1);
  force_validation();
  /* map_feilds must be last */
  map_feilds();
}
//$("textarea").parsley().addError("myError", { message: "Custom Error" }, "", true);

window.Parsley.addValidator("no_valid_address", {
  validateString: function (value, requirement) {
    //$(".parsley-no_valid_address").show();
    //console.log("pac_input_it_typing", pac_input_it_typing);
    return !pac_input_it_typing;
  } /* end function */,
  messages: {
    en: "Please Select your building address from the drop-down"
  }
});

window.Parsley.addValidator("street_number", {
  validateString: function (value, requirement) {
    let street_number = getSessionStorageItem(`street_number`);
    // when type and select no street option //
    //$(".parsley-no_valid_address").hide();
    return street_number !== null;
  } /* end function */,
  messages: {
    en: `Please include a building number`
  }
});

/* ############################################
          3 of 10  Hubspot Mapping 🤠
###############################################*/

let hubspot_form_feilds = [
  "contact_type",
  "email",
  "firstname",
  "lastname",
  "name" /* for full name "as is" the value of the feild */,
  "message",
  "state",
  "city",
  "address",
  "zip",
  "utm_campaign",
  "utm_source",
  "utm_medium",
  "utm_content",
  "utm_term"
];

var utms = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content"
];

/* put this code global in your project
var utms = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content"
];

function getUTMParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
  return results === null
    ? ""
    : decodeURIComponent(results[1].replace(/\+/g, " "));
}

if (typeof Storage !== "undefined") {
  sessionStorage.referrer = document.referrer;

  for (var i = 0; i < utms.length; i++) {
    var utm = utms[i],
      utm_value = getUTMParameterByName(utm);
    if (utm_value) {
      sessionStorage.setItem(utm, utm_value);
    }
  }
} else {
  // Sorry! No Web Storage support..
}

*/

function hubspot_genrate_feilds_object() {
  const array_feilds = [];
  hubspot_form_feilds.forEach((this_value) => {
    let value = "";
    // print the current element of the array
    switch (this_value) {
      /* when the key and the form feild match */
      case "contact_type":
        value = contact_type; /* owner, renter, other */
        break;
      case "email":
        /* SET Feild Value (From session storage) */
        value = getSessionStorageItem(this_value);
        break;
      case "firstname":
        /* SET Feild Value (From session storage) */
        var full_name = getSessionStorageItem("full_name");
        if (full_name !== null) {
          value = full_name.replace(/ .*/, ""); /* ezra siton to "ezra"*/
        }
        break;
      case "lastname":
        /* SET Feild Value (From session storage) */
        var full_name = getSessionStorageItem("full_name");
        if (full_name !== null) {
          let words_cound = full_name.split(" ").filter((x) => x !== "").length;
          if (words_cound > 1) {
            full_name = full_name.substring(
              full_name.indexOf(" ") + 1
            ); /* ezra siton to "siton"*/
          } else {
            full_name = "";
          }
        } else {
          full_name = "";
        }
        value = full_name;
        break;
      case "name":
        value = getSessionStorageItem("full_name");
        break;

      case "message":
        var message = getSessionStorageItem(this_value);
        if (message !== null) value = message;
        break;
      case "state":
        var state = getSessionStorageItem("administrative_area_level_1");
        if (state !== null)
          value = getSessionStorageItem("administrative_area_level_1");
        break;
      case "city":
      case "sublocality_level_1":
        var sublocality_level_1 = getSessionStorageItem("sublocality_level_1");
        var locality = getSessionStorageItem("locality");
        if (locality !== null) value = locality;
        if (sublocality_level_1 !== null) {
          if (sublocality_level_1 == "Manhattan") {
            value = "New York";
          } else {
            value = sublocality_level_1;
          }
        }
        break;
      case "address":
        var street_number = getSessionStorageItem("street_number");
        var route = getSessionStorageItem("route");
        if (route !== null)
          value =
            getSessionStorageItem("street_number") +
            getSessionStorageItem("route");
        break;
      case "zip":
        let postal_code = getSessionStorageItem("postal_code");
        if (postal_code !== null) value = getSessionStorageItem("postal_code");
        break;
      case "utm_source":
      case "utm_medium":
      case "utm_campaign":
      case "utm_term":
      case "utm_content":
        var utm_value = sessionStorage.getItem(this_value);
        if (utm_value !== null) value = sessionStorage.getItem(this_value);
        break;
      default:
        console.error("no such case for: " + this_value);
    }

    var newObj = {};
    newObj["name"] = this_value;
    newObj["value"] = value;
    array_feilds.push(newObj);
  });
  //console.log(array_feilds);

  return array_feilds;
}

async function hubspot_send_form_by_post_api_call(dispatchEvent) {
  if (production) {
    const portalId = "8041603";
    const formId = "2a169d2c-ca93-4fb6-8d9b-7454bd50d1ce";
    let feilds = hubspot_genrate_feilds_object();

    /* Get IP by API */
    const get_api_server_url = "https://api.ipify.org?format=json";
    let ip = await fetch(get_api_server_url)
      .then((response) => {
        return response.json();
      })
      .then((my_ip) => {
        return my_ip.ip;
      })
      .catch(function (err) {
        // some error here
        console.error(`${get_api_server_url} - The IP api is not working`);
      }); /* end ip fetch */
    console.log(ip);

    /* hubspot */
    var data = {
      fields: feilds,
      context: {
        hutk: document.cookie.replace(
          /(?:(?:^|.*;\s*)hubspotutk\s*\=\s*([^;]*).*$)|^.*$/,
          "$1"
        ),
        /* include this parameter and set it 
            to the hubspotutk cookie value
             to enable cookie tracking on your submission*/
        pageUri: window.location.href,
        pageName: document.title
        //ipAddress: ip
      }
    };
    if (ip !== undefined) Object.assign(data["context"], { ipAddress: ip });

    let url = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`;

    fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res, data);
        if (dispatchEvent) document.dispatchEvent(hubspot_formSubmitted);
      }); /* end hubspot fetch */
  } /* end if production */
} // end send_hubspot_form

/* ##############################################################
        5 of 10 - On Webflow FORM SUBMIT  🤠
  /* ##############################################################*/

/*
  <script charset="utf-8" type="text/javascript" src="//js.hsforms.net/forms/embed/v2.js"></script>
<script>
  hbspt.forms.create({
    region: "na1",
    portalId: "8041603",
    formId: "2a169d2c-ca93-4fb6-8d9b-7454bd50d1ce"
  });
</script>
*/

document.addEventListener("webflow_form_submit", () => {
  let event_name = get_event_name();
  hubspot_send_form_by_post_api_call(true);
  //console.log("The slideChange event was triggered")
  let thank_you_page_redirect_url = get_thank_you_page_url();

  if (production) {
    clear_all_sessionStorage_feilds();
    redirect_url(thank_you_page_redirect_url);
  }
  /* 🚩 IN USA area Or Out of USA Area Match the thank you page 🚩 */
});

function get_thank_you_page_url() {
  let is_in_area = getSessionStorageItem(`in_area`);

  if (is_in_area === null) {
    is_in_area = false;
  }
  /* url list */
  let hubspot_meeting = `/thank-you/meeting?email=${getSessionStorageItem(
    `email`
  )}&type=${contact_type}`;
  let follow_us_page = `/thank-you/follow-us?type=${contact_type}`;

  let in_area_thank_you_page = `/thank-you/welcome?type=${contact_type}`;
  let our_of_area_thank_you_page = `/thank-you/follow-us?type=${contact_type}`;

  switch (contact_type) {
    case "Board member":
    case "Owner": {
      let url = is_in_area ? hubspot_meeting : follow_us_page;
      return url;
      break;
    }
    case "Renter": {
      let url = is_in_area
        ? in_area_thank_you_page
        : our_of_area_thank_you_page;
      return url;
      break;
    }
    default:
      console.error(`Sorry no such contact_type ${contact_type}`);
  } /* end switch */
}

/*##################🙂‍↔#########################
                  6 of 10  navigateTo 🤠
    ####################🙂‍↔##########################*/

function navigateTo(index = 0, setLocalStorage = true, push_state = false) {
  // To trigger the Event

  document.dispatchEvent(slideChange);

  //console.clear();
  if (total_slides <= index) {
    index = 0;
  }

  //check_entire_form_status();
  control_Navigation(index);

  /* pushState only when you navigateTo (Not when user go back/forward on the broswer history) */
  //console.log("from:" + get_curIndex(), "to:" +  index);

  /* THE ORDER here matters */
  show_current_slide(index);
  if (production) setFeildFocus(index);

  /* Disable localstorage only if the user go backward (The back is without any validation) */
  if (setLocalStorage) {
    map_feilds();
  }

  /* HASH Handler - if step before is false */
  let before_steps_are_true = check_entire_form_status();
  before_steps_are_true = before_steps_are_true.slice(0, index);
  //console.log(before_steps_are_true);
  let errors_before_this_step = steps_back_are_not_valid(before_steps_are_true);
  //console.log(before_steps_are_true, errors_before_this_step);

  if (errors_before_this_step) {
    console.error("with errors");
    navigateTo(0);
  }
  toogle_next_button();
  setProgressBar(index);
  set_progress_bar_message(index);
}

/*##################🙂‍↔############################
                  7 of 10 map_feilds 🤠
    ####################🙂‍↔##########################*/

function clear_all_sessionStorage_feilds() {
  var $sections_feilds = $("[form_step] input, textarea");
  $sections_feilds.each(function (index) {
    var feild_name = $(this).attr("name");
    console.log("feild_name feild_name", feild_name);
    sessionStorageRemoveItem(feild_name);
  }); /* end each*/
  reset_address();
}

function map_feilds() {
  var $sections_feilds = $("[form_step] input, textarea");
  /* remove the readonly data */
  $(".mapping").remove();

  $sections_feilds.each(function (index) {
    var feild_name = $(this).attr("name");
    var node_Type = $(this).prop("type").toLowerCase();
    var feild_value;
    /* text, email radio and so on */

    if (getSessionStorageItem(feild_name) !== null) {
      // Restore the contents of the text field
      let sessionStorage_value = getSessionStorageItem(feild_name);
      feild_value = sessionStorage_value;
    } else {
      feild_value = $(this).val();
    }

    switch (node_Type) {
      /* set values for regular feilds */
      case "text":
      case "email":
      case "textarea":
        /* SET Feild Value (From session storage) */
        /* If user select value from autocomplete dropdown do not change the value */
        $(this).val(feild_value);
        break;
      case "radio":
        if (getSessionStorageItem(feild_name) !== null) {
          $(this).filter(`[value="${feild_value}"]`).prop("checked", true);
        }
        break;
      default:
        console.log("no such case for");
    }

    //console.log(feild_name, ":", feild_value);
    if ($(this).prop("checked") || node_Type !== "radio") {
      var $newNode = $(
        `<li class="mapping"><b>${feild_name}</b>: ${feild_value}</li>`
      );
      $("#map").append($newNode);
    }
  }); /* end each*/

  $("#map").append(`<h4 class="mapping">Place values</h4>`);

  google_places_keys.forEach((this_value) => {
    // print the current element of the array
    var $newNode = $(
      `<li class="mapping"><b>${this_value}</b>: ${getSessionStorageItem(
        this_value
      )}</li>`
    );

    if (this_value == "in_area" && getSessionStorageItem("in_area") !== null) {
      $newNode.css("color", "green");
      $newNode.css("font-size", "16px");
    }

    $("#map").append($newNode);
  });

  $("#map").append(`<h5 class="mapping">Hubspot values</h5>`);
  let hubspot_feilds = hubspot_genrate_feilds_object();

  hubspot_feilds.forEach((this_value) => {
    //console.log(this_value);
    // print the current element of the array
    var $newNode = $(
      `<li class="mapping" style="color: orange"><b>${this_value.name}</b>: ${this_value.value} </li>`
    );

    $("#map").append($newNode);
  });

  $("#map").append(
    `<div class="mapping"><h6 >Thank you page URL:</h6><p>${get_thank_you_page_url()}</p></div>`
  );
}

/*##################🙂‍↔############################
                8 of 10    HELPER FUNCTION 🤠
  ######################🙂‍↔##########################*/

function reset_address() {
  google_places_keys.forEach((this_value) => {
    // print the current element of the array
    sessionStorageRemoveItem(this_value);
  });
}

function sessionStorageRemoveItem(value) {
  //console.log("sessionStorageRemoveItem", contact_type + "_" + value);
  sessionStorage.removeItem(contact_type + "_" + value);
}

function getSessionStorageItem(value) {
  return sessionStorage.getItem(contact_type + "_" + value);
}

function setStorageItem(key, value) {
  sessionStorage.setItem(contact_type + "_" + key, value);
} /* end setStorageItem */

function redirect_url(url) {
  //window.location.replace(url);
  //console.log("redirect to" + url);
  if (dev_mode) {
    alert("redirect to" + url);
  }
  if (!dev_mode) {
    //window.location.href = url;
    window.location.replace(url);
  }
}
function set_progress_bar_message(index) {
  let message = $("[progress_bar_message]")
    .eq(index)
    .attr("progress_bar_message");
  $("[progress_bar_text_node]").text(message);
}

function animation(from, to) {}

function steps_back_are_not_valid(arr) {
  let findErrors = false;
  arr.reduceRight((total, item) => {
    //console.log("item", item);
    if (item == false) findErrors = true;
    // Do somthing here and remember the return statement
    return item;
  }, 0);
  return findErrors;
}

function push_state_on_slide_changed(to) {
  //console.log("push_state_on_slide_changed");
  const url = new URL(location);
  url.searchParams.set("step", to);
  const state = { step: to };
  //history.pushState(state, "unused", url);
  //history.replaceState(state, "unused", url);
}

// Show only the navigation buttons that make sense for the current section:
function control_Navigation(index) {
  /* hide prev on first slide - not relevant for this ui */
  //$prev.toggle(index > 0);

  var atTheEnd = index >= $sections.length - 1;
  //$('.form-navigation .next').toggle(!atTheEnd);
  if (atTheEnd) {
    $next.text("submit");
  } else {
    $next.text("next");
  }
  $(".form-navigation [submit]").toggle(atTheEnd);
}

function setProgressBar(index) {
  let total_slides_ = total_slides + 1;
  let progress = parseInt(index / total_slides_);
  $("[progress_of]").text(parseInt(index) + 1);
  $("[progress_total]").text(total_slides);
  let percentage = ((parseInt(index) + 1) / total_slides_) * 100;
  $("[progress_percentage]").text(percentage.toFixed(1) + "%");

  /* webflow */
  $("[progress_bar]").css("width", percentage + "%");
}

// Mark the current section with the class 'current'
function show_current_slide(index) {
  //$sections.removeClass("current").eq(index).addClass("current");
  $sections.removeAttr("current").eq(index).attr("current", "current");

  $sections.css("display", "none").eq(index).css("display", "flex");
}

function setFeildFocus(index) {
  if (production && $(window).width() > 960) {
    $sections.eq(index).find("input:not([type='radio'])").first().focus();
    $sections.eq(index).find("textarea").first().focus();
  }
}

function get_curIndex() {
  // Return the current index by looking at which section has the class 'current'
  //return $sections.index($sections.filter(".current"));
  return $sections.index($sections.filter("[current]"));
}

function submit_webflow_form() {
  map_feilds();
  document.dispatchEvent(webflow_form_submit);
}

/* send email hb form only once 
(and not each time the user click next/prev)*/
let email_hubspot_form_send = false;

function show_loader() {
  $("[loader_wrapper]").addClass("shown");
}

function hide_loader() {
  $("[loader_wrapper]").removeClass("shown");
  $("[loader_wrapper]").parent().removeAttr("show_on_load");
}

function next_step() {
  let event_name = get_event_name();
  var atTheEnd = get_curIndex() >= $sections.length - 1;
  $(".parsley-errors-list").css("opacity", 1);

  $webflow_form
    .parsley()
    .whenValidate({
      group: "block-" + get_curIndex()
    })
    .done(function () {
      /* If last step next should submit the form */
      if (atTheEnd) {
        document.dispatchEvent(slideNext);
        show_loader();

        if (production && get_curIndex()) {
          $("[progress_bar]").css("width", 100 + "%");
          setTimeout(function () {
            // function code goes here
            submit_webflow_form();
          }, 900);
        }
      } else {
        // If event name is email send the hubspot form + Do not dispatchEvent //
        if (event_name === "email" && !email_hubspot_form_send && production) {
          email_hubspot_form_send = true;
          /* false ==> do not dispatchEvent */
          hubspot_send_form_by_post_api_call(false);
        }

        document.dispatchEvent(slideNext);
        // Go to Next Slide
        navigateTo(get_curIndex() + 1);
      }
    });
}

/*##################👆🏼👆🏼👆↔############################
                  9 of 10    CLICK FUNCTION 🤠
      ####################👆🏼👆🏼👆↔##########################*/

// Previous button is easy, just go back
$prev.click(function () {
  if (get_curIndex() === 0) {
    $("[progress_bar]").css("width", 0 + "%");
    setTimeout(function () {
      // Redirect only on webflow io or publish url //
      if (location.href.includes("daisy"))
        window.location.href = landing_page_url;
    }, 900);
  } else {
    animation(get_curIndex(), get_curIndex() - 1);
    navigateTo(get_curIndex() - 1, false);
  }
});

$clear_storage_btn.click(function () {
  sessionStorage.clear();
});

$next.click(function () {
  next_step();
});

$('[type="radio"]').click(function () {
  let data_go_to = $(this).attr("data-go-to");
  /* If the Radio go to diff flows */
  if (data_go_to !== undefined) {
    /* SOME BUG YOU must put this to change the radio value */
    $webflow_form
      .parsley()
      .whenValidate({
        group: "block-" + get_curIndex()
      })
      .done(function () {
        /* if we set custom data-go-to value */
        document.dispatchEvent(slideNext);
        redirect_url(data_go_to);
      });
  } else {
    /* else go to next step */
    next_step();
  }
});

$("input").on("keyup", function () {
  toogle_next_button();
}); /* end on input */

$("[pac_input]").on("focusout", function () {
  //$(".parsley-errors-list").css("opacity", 0.5);
  //reset_address();
  //map_feilds();
}); /* end on input */

/* Click Enter */
$(document).on("keydown", "input", function (e) {
  /* show error message if click enter */
  // console.log(e.which);
  if (e.which == 50) {
    //backspace keycode
    //Do something
  }

  if (e.which === 13) {
    $(".parsley-errors-list").css("opacity", 1);
    var inputVal = $(this).val();
    console.log("You've entered: " + inputVal);
    var atTheEnd = get_curIndex() >= $sections.length - 1;

    if (atTheEnd) {
      if ($webflow_form.parsley().validate("block-" + get_curIndex())) {
        next_step();
      } /* end nested if */
    } else {
      if ($webflow_form.parsley().validate("block-" + get_curIndex()))
        navigateTo(get_curIndex() + 1);
    }
  } else {
    /* hide error message when typing */
    $(".parsley-errors-list").css("opacity", 0);
  }
});

function check_entire_form_status() {
  const steps_status = [];

  $sections.each(function (index, section) {
    let status = $webflow_form.parsley().isValid({
      group: "block-" + index
    });
    steps_status.push(status);
  });
  return steps_status;
} /* end check_entire_form_status */

function toogle_next_button() {
  let step_status = $webflow_form.parsley().isValid({
    group: "block-" + get_curIndex()
  });

  $next.toggleClass(active_button_class, step_status);
  //$next.attr("disabled", step_status);

  //console.log("status", get_curIndex(), step_status);
  return step_status;
} // toogle_next_button

function get_step_hash() {
  let params = new URLSearchParams(document.location.search);
  let step = params.get("step");
  return step;
}

function is_valid_slide(index) {
  let is_valid = $webflow_form.parsley().isValid({
    group: "block-" + index
  });
  return is_valid;
}

function on_init_navigate_to_step_hash() {
  let params = new URLSearchParams(document.location.search);
  let step = get_step_hash();

  //let is_valid_step = check_this_step_status();
  let isNull = Object.is(step, null);

  if (!isNull && step > 0) {
    navigateTo(step);
  } else {
    navigateTo(0);
  }
}

window.addEventListener("popstate", (event) => {
  console.log("popstate", event);
  console.log(
    `location: ${document.location}, state: ${JSON.stringify(event.state)}`
  );
  navigateTo(0);
}); /* end popstate */

/*###############################################*/
/* ########### 10 of 10 Parsley EVENTS 🤠 ###########*/
/*##############################################*/

/* ########### A. FORM LEVEL ########### */
Parsley.on("form:init", function (i) {
  //Triggered when a Form is bound for the first time.
  console.log("form:init");
  //navigateTo(0);
});

Parsley.on("form:validate", function (i) {
  //Triggered when a form validation is triggered, before its validation
  //console.log("form:validate");
});

Parsley.on("form:success", function (i) {
  // Triggered when a form validation is triggered, after its validation succeeds.
  //console.log("form:success");
});

Parsley.on("form:error", function (i) {
  //Triggered when a form validation is triggered, after its validation fails
  //console.log("form:error");
  if ($(".parsley-no_valid_address").length > 0) {
    $(".parsley-street_number").css("display", "none");
  } else {
    $(".parsley-street_number").css("display", "initial");
  }
  if (get_event_name() == "address") {
    reset_address();
    map_feilds();
  }
});

Parsley.on("form:validated", function (i) {
  //Triggered when a form validation (with success or with errors).
  //console.log("form:validated");
});

Parsley.on("form:submit", function (i) {
  //Triggered when after a form validation succeeds and before the form is actually submitted
  console.log("form:submit");
});

/* ########### B. FEILD LEVEL */
Parsley.on("field:init", function (i) {
  //Triggered when a Field is bound for the first time
  console.log("field:init");
});

Parsley.on("field:validate", function (i) {
  //Triggered when a field validation is triggered, before its validation
  console.log("field:validate");
});

Parsley.on("field:success", function (i) {
  //Triggered when a field validation succeeds.
  console.log("field:success");
});

Parsley.on("field:error", function (i) {
  //Triggered when a field validation fails
  console.log("form:error");
});

Parsley.on("field:validated", function (i) {
  // Triggered after a field is validated (with success or with errors).
  //var ok = $('.parsley-error').length === 0;
  //console.log("form:validated", ok);
  setStorageItem(i.element.name, i.value);
});

$("input:not([pac_input])").on("change", function (i) {
  console.log($(this).val());

  setStorageItem($(this).attr("name"), $(this).val());
});

on_init_navigate_to_step_hash();

function force_validation() {
  $next.toggleClass(active_button_class, false);
  $webflow_form
    .parsley()
    .whenValidate({
      group: "block-" + get_curIndex()
    })
    .done(function () {
      let step_status = $webflow_form.parsley().isValid({
        group: "block-" + get_curIndex()
      });
      //alert(step_status);

      $next.toggleClass(active_button_class, true);
    });
}
