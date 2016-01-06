/*jslint browser: true, plusplus: true*/
/*global alert, console*/

var clickOnFileInput = function() {
    "use strict";
    document.getElementById("mosaicFile").click();
};

// This Function is responsible to load the uploaded image inside Canvas - imageCanvas
var loadImageToCanvas = function() {
    "use strict";
    var filesSelected = document.getElementById("mosaicFile").files,
        fileToLoad, fileReader = new FileReader(),
        canvas = document.getElementById("imageCanvas"),
        ctx = canvas.getContext("2d");

    if (filesSelected.length > 0) {
        fileToLoad = filesSelected[0];
        document.getElementById("mosaicFileName").innerHTML = "File: " + fileToLoad.name;

        // After Upload Display the MosaicIt button & clear the photoMosaic section
        document.getElementById("mosaicTheImageBtn").style.display = "block";
        document.getElementById("tranformedImageView").innerHTML = "";
        document.getElementById("loadingPlaceHolder").style.display = "block";

        // Clean the Canvas before rendering
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (fileToLoad.type.match("image.*")) {
            fileReader.onload = function(fileLoadedEvent) {
                var img = new Image();

                // Images below 600 * 500 are displayed as is, whereas bigger images sizes are changed
                img.onload = function() {
                    if (img.width > 600 || img.height > 500) {
                        canvas.width = 350;
                        canvas.height = 350;
                    } else {
                        canvas.width = img.width;
                        canvas.height = img.height;
                    }
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                };
                img.src = fileLoadedEvent.target.result;
            };
            fileReader.readAsDataURL(fileToLoad);
        }
    }
};

// Row traversal of the Uploaded Image and then send the codes to photoMosaicTheImage()
var convertToMosaic = function() {
    "use strict";
    var canvas = document.getElementById("imageCanvas"),
        ctx = canvas.getContext("2d"),
        colorToProcess = [],
        toSendToServer = [],
        yTraverse, xTraverse;

    for (yTraverse = 0; yTraverse < Math.floor(canvas.height / TILE_HEIGHT); yTraverse++) {
        for (xTraverse = 0; xTraverse < Math.floor(canvas.width / TILE_WIDTH); xTraverse++) {
            toSendToServer.push(getDominantColor(xTraverse, yTraverse, ctx));
        }
        colorToProcess[yTraverse] = toSendToServer;
        toSendToServer = [];
    }
    photoMosaicTheImage(colorToProcess);
};

// Determine the color which appears the most in the Tile
var getDominantColor = function(xTraverse, yTraverse, ctx) {
    "use strict";
    var averageColor = {},
        key, myImageData, yCol, xCol, sortedcolours;

    for (yCol = 0; yCol < TILE_HEIGHT; yCol++) {
        for (xCol = 0; xCol < TILE_WIDTH; xCol++) {
            myImageData = ctx.getImageData(xCol + (TILE_WIDTH * xTraverse), yCol + (TILE_HEIGHT * yTraverse), 1, 1);
            key = myImageData.data[0] + "," + myImageData.data[1] + "," + myImageData.data[2] + "," + myImageData.data[3];
            if (myImageData.data[3] === 0) {
                return "255,255,255,255";
            }
            if (averageColor[key]) {
                averageColor[key]++;
            } else {
                averageColor[key] = 1;
            }
        }
    }
    sortedcolours = Object.keys(averageColor).sort(
        function(a, b) {
            return -(averageColor[a] - averageColor[b]);
        });
    return sortedcolours[0];
};

// A Promise chain is created to follow the order of execution
var photoMosaicTheImage = function(colorToProcess) {
    "use strict";
    var promise = Promise.resolve();

    colorToProcess.forEach(function(item) {
        item.forEach(function(value, index) {
            promise = promise.then(MosaicServerFetchPromise.bind(null, value));
            // If the end of the row is reached then break to next line
            if (index === item.length - 1) {
                promise = promise.then(function() {
                    return new Promise(function(resolve) {
                        document.getElementById("tranformedImageView").innerHTML += "<br>";
                        return resolve();
                    });
                });
            }
        });
    });

    document.getElementById("mosaicTheImageBtn").style.display = "none";
    document.getElementById("loadingPlaceHolder").style.display = "none";
    return promise;
};

// Server Call to Fetch the Response and append it to the tranformedImageView section
function MosaicServerFetchPromise(RGBAcolor) {
    "use strict";
    var xmlhttp;
    return new Promise(function(resolve, reject) {
        xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === XMLHttpRequest.DONE) {
                if (xmlhttp.status === 200) {
                    document.getElementById("tranformedImageView").innerHTML += xmlhttp.response;
                    return resolve(xmlhttp.response);
                } else if (xmlhttp.status === 400) {
                    return reject(xmlhttp.responseText);
                } else {
                    // console.log("something else other than 200 was returned");
                }
            }
        };
        xmlhttp.open("GET", "/color/" + rgba2hex(RGBAcolor), true);
        xmlhttp.send();
    });
}

// Convert RGBA value to HEX equivalent
var rgba2hex = function(rgba) {
    "use strict";
    var r, g, b, a;
    rgba = rgba.split(",");
    r = parseInt(rgba[0], 10);
    g = parseInt(rgba[1], 10);
    b = parseInt(rgba[2], 10);
    a = parseInt(rgba[3], 10);

    if (r > 255 || g > 255 || b > 255 || a > 255) {
        //console.log("Invalid color component");
    }

    return (256 + r).toString(16).substr(1) + ((1 << 24) + (g << 16) | (b << 8) | a).toString(16).substr(1);
};
