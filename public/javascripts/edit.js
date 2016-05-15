/**
 * Created by chimwemwe on 11/11/15.
 */

var counter = 0;

function __$(id) {
    return document.getElementById(id);
}

function addSymptom() {

    if (!__$("tbody"))
        return;

    var row = document.createElement("tr");
    row.id = "row" + counter;

    __$("tbody").appendChild(row);

    var cell1 = document.createElement("td");
    cell1.setAttribute("align", "right");
    cell1.innerHTML = "&nbsp;";

    row.appendChild(cell1);

    var cell2 = document.createElement("td");
    cell2.setAttribute("align", "center");
    cell2.innerHTML = ":";

    row.appendChild(cell2);

    var cell3 = document.createElement("td");
    cell3.setAttribute("align", "right");

    row.appendChild(cell3);

    var input = document.createElement("input");
    input.type = "text";
    input.className = "textbox";
    input.name = "symptom";

    cell3.appendChild(input);

    var cell4 = document.createElement("td");
    cell4.style.width = "40px";

    row.appendChild(cell4);

    var btn = document.createElement("input");
    btn.setAttribute("tag", counter);
    btn.type = "button";
    btn.className = "button blue";
    btn.value = "-";
    btn.style.minWidth = "40px";
    btn.style.minHeight = "20px";
    btn.style.padding = "5px";
    btn.onmousedown = function () {

        deleteSymptom("row" + this.getAttribute("tag"));

    }

    cell4.appendChild(btn);

    counter++;

}

function deleteSymptom(id) {

    if (__$("tbody") && __$(id)) {

        if (confirm("Do you really want to delete this symptom?")) {

            __$("tbody").removeChild(__$(id));

        }

    }

}

function validate() {

    var valid = true;

    if (__$("topic").value.trim().length <= 0) {

        alert("Topic is a required therefore field it can't be empty!")

        __$("topic").focus();

        valid = false;

    }

    if (!valid)
        return;

    if (__$("concepts").value.trim().length <= 0) {

        alert("Select at least a concept to proceed!")

        __$("concepts").focus();

        valid = false;

    }

    if (!valid)
        return;

    if (__$("article").value.trim().length <= 0) {

        alert("The article body is a required therefore field it can't be empty!")

        __$("article").focus();

        valid = false;

    }

    if (!valid)
        return;

    var symptoms = document.getElementsByName("symptom");

    for (var i = 0; i < symptoms.length; i++) {

        if (symptoms[i].value.trim().length <= 0) {

            alert("All fields are required!");

            symptoms[i].focus();

            valid = false;

            break;

        }

    }

    if (!valid)
        return;

    document.forms[0].submit();

}

function ajaxRequest(url, callback, defaults) {

    var httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function () {
        handleAjaxRequest(httpRequest, callback, defaults);
    };
    try {
        httpRequest.open("GET", url, true);
        httpRequest.setRequestHeader("Content-type", "application/json;charset=UTF-8");
        httpRequest.send(null);
    } catch (e) {
    }
}

function handleAjaxRequest(aXMLHttpRequest, callback, defaults) {
    if (!aXMLHttpRequest) return;

    if (aXMLHttpRequest.readyState == 4 && (aXMLHttpRequest.status == 200 ||
        aXMLHttpRequest.status == 304)) {

        var result = JSON.parse(aXMLHttpRequest.responseText);

        callback(result, defaults);

    }
}

function loadConcepts(json, defaults) {

    if (!json)
        return;

    if (__$("concepts")) {

        __$("concepts").innerHTML = "";

        for (var i = 0; i < json.length; i++) {

            var opt = document.createElement("option");

            opt.innerHTML = json[i];

            if (defaults.includes(json[i])) {

                opt.setAttribute("selected", true);

                opt.onclick = function () {

                    this.setAttribute("selected", false);

                    // this.removeAttribute("selected");

                }

            }

            __$("concepts").appendChild(opt);

        }

    }

}

function imgToDataURI(image) {

    if (image.src.match(/^data\:image/))
        return;

    var c = document.createElement('canvas');
    var ctx = c.getContext("2d");

    c.width = image.naturalWidth;
    c.height = image.naturalHeight;
    ctx.drawImage(image, 0, 0);

    image.src = c.toDataURL();

}

function reTagImages() {

    clearInterval(intImages);

    var images = document.getElementsByTagName("img");

    for (var i = 0; i < images.length; i++) {

        if (!images[i].crossOrigin) {

            images[i].crossOrigin = "Anonymous";

        } else if(!images[i].getAttribute("loaded")) {

            images[i].onload = function() {

                this.setAttribute("loaded", true);

            }

        } else {

            if (images[i].getAttribute("loaded") && !images[i].src.match(/^data\:image/))
                imgToDataURI(images[i]);

        }

    }

    intImages = setInterval(function () {

        reTagImages();

    }, 500);

}

var intImages = setInterval(function () {

    reTagImages();

}, 500);

