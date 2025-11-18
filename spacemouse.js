let uniqueId = generateUniqueId();

function generateUniqueId() {
  const randomNumber = Math.floor(Math.random() * 1000000);
  const timestamp = new Date().getTime();
  const uniqueId = `${timestamp}_${randomNumber}`;
  return uniqueId;
}


// MQTT CONNECTION --------------
const brokerOptions = {
    clientId: uniqueId,  
    username: 'your_username',   
    password: 'your_password',   
    clean: true                 
};
  
const options = {
  qos: 0
};

// Define variables to store MQTT broker and port
let broker;
let client

// Event listener for the Connect button
document.getElementById("connectButton").addEventListener("click", function() {
    // Read the values from the MQTT Broker and Port inputs
    broker = document.getElementById("mqttBroker").value;

    // Establish the MQTT connection
    client = mqtt.connect('wss://openlab.kpi.fei.tuke.sk/mqtt', brokerOptions);
    updateConnectionStatus('Connecting...');
  
    client.on('connect', onConnect);
    client.on('offline', function () {
        updateConnectionStatus('Disconnected');
    });
    client.on('message', onMessage);
    client.on('error', onError);
});

// Event listener for the Disconnect button
document.getElementById("disconnectButton").addEventListener("click", function() {
    // Disconnect from MQTT broker
    if (client) {
        client.end();
        updateConnectionStatus('Disconnected');
    }
});

// Function to update connection status text
function updateConnectionStatus(status) {
    document.getElementById("connectionStatus").textContent = status;
}

function onConnect() {
  updateConnectionStatus('Connected')
  client.subscribe('MimaDzp/#', options);  
}
  
function exit(){
 // client.publish('MimaDzp/Avatars/' , "exit");
  window.history.back();
}

// Maintain a set to store added avatar names
var addedAvatars = new Set();
var avatarSelectedID = null;

// Maintain a set to store added avatar names
var addedAvatars = new Set();
var avatarSelectedID = null;

function onMessage(topic, message) {
    var topicString = topic.toString();
    console.log(topicString);

    // Check if the topic starts with 'MimaDzp/Avatars/'
    if (topicString.startsWith('MimaDzp/Avatars/')) {
        // Extract the avatar name from the topic
        var avatarName = topicString.substring('MimaDzp/Avatars/'.length).split('/')[0]; // Extract the parent name only

        // If message is "exit", remove the corresponding avatar
        message = message + "";
        if (message === "exit") {
            var avatars = document.querySelectorAll('.avatar h3');
            avatars.forEach(function(avatar) {
                if (avatar.textContent === avatarName) {
                    avatar.parentElement.remove();
                    if (avatarSelectedID === avatarName) {
                        avatarSelectedID = null;
                    }
                }
            });
        } else {
            // Check if the avatar name is not already added as a complete word
            if (!addedAvatars.has(avatarName)) {
                // Create a new <div> element for the avatar
                var newAvatarDiv = document.createElement('div');
                newAvatarDiv.className = 'avatar';
                var newAvatarHeading = document.createElement('h3');
                newAvatarHeading.textContent = avatarName;
                newAvatarDiv.appendChild(newAvatarHeading);
              
                // Add event listener to the new avatar element
                newAvatarDiv.addEventListener('click', function() {
                    // Remove border from previously selected avatar
                    var prevSelectedAvatar = document.querySelector('.avatar.selected');
                    if (prevSelectedAvatar) {
                        prevSelectedAvatar.classList.remove('selected');
                    }
                    // Add border to the clicked avatar
                    newAvatarDiv.classList.add('selected');
                    // Set the selected avatar ID to the clicked avatar's name
                    avatarSelectedID = avatarName;
                    console.log('Avatar selected:', avatarSelectedID);
                });

                // Append the new avatar <div> to the avatar-list-container
                var avatarListContainer = document.querySelector('.avatar-list-container');
                avatarListContainer.appendChild(newAvatarDiv);

                // Add the avatar name to the set of added avatars
                addedAvatars.add(avatarName);
            }
        }
    }
}

// Callback for connection errors
function onError(error) {
    updateConnectionStatus('Error: ' + error)
}

// Gracefully close the connection on program termination
window.addEventListener('beforeunload', () => {
    client.end();
});
  
// MQTT CONNECTION --------------
let Tspeed = 1;
let permaTdeficit = 0.01;
const tspeedInput = document.getElementById("tSpeed");
tspeedInput.addEventListener("input", function() {
    // Update const speed with the value from the input field
    Tspeed = parseFloat(this.value);
    document.getElementById("tSpeedValue").textContent = this.value;
});

let Rspeed = 1;
let permaRdeficit = 0.01;
const rspeedInput = document.getElementById("rSpeed");
rspeedInput.addEventListener("input", function() {
    // Update const speed with the value from the input field
    Rspeed = parseFloat(this.value);
    document.getElementById("rSpeedValue").textContent = this.value;
});

let controllerInfo = document.getElementById("controller");

         let device;

         navigator.hid.addEventListener("connect", handleConnectedDevice);
         navigator.hid.addEventListener("disconnect", handleDisconnectedDevice);

         function handleConnectedDevice(e) {
            console.log("Device connected: " + e.device.productName);
           controllerInfo.textContent = "Device connected: " + e.device.productName;
         }

         function handleDisconnectedDevice(e) {
            console.log("Device disconnected: " + e.device.productName);
            controllerInfo.textContent = "No HID connected.";
         }

         function selectDevice() {

            navigator.hid.requestDevice({ filters: [{ vendorId: 0x046d }] })
            .then((devices) => {
               if (devices.length == 0) return;
               device = devices[0]
               if (!device.opened) device.open()      // avoid re-opening an already open device
               .then(() => {
                 controllerInfo.textContent = "Opened device: " + device.productName;
                  console.log("Opened device: " + device.productName);
                  device.addEventListener("inputreport", handleInputReport);
               })
               .catch(error => { console.error(error)
               })
            });
         }

         function handleInputReport(e) {

            switch ( e.reportId ) {
            case 1:      // translation event
               const Tx = e.data.getInt16(0, true);   // 'true' parameter is for little endian data
               const Ty = e.data.getInt16(2, true);
               const Tz = e.data.getInt16(4, true);
               console.log("Translate: ["+Tx+","+Ty+","+Tz+"]");
               updateTranslationSliders(Tx, Ty, Tz);
                if(avatarSelectedID)
                  client.publish('MimaDzp/Avatars/' + avatarSelectedID + '/translate' , 
                               "["+Tx*Tspeed*permaTdeficit+",0,"+Ty*Tspeed*permaTdeficit*(-1)+"]");
               break;
                  
            case 2:      // rotation event
               const Rx = e.data.getInt16(0, true);
               const Ry = e.data.getInt16(2, true);
               const Rz = e.data.getInt16(4, true);
               console.log("Rotate: ["+Rx+","+Ry+","+Rz+"]");
               updateRotationSliders(Rx, Ry, Rz);
                if(avatarSelectedID)
                  client.publish('MimaDzp/Avatars/' + avatarSelectedID + '/rotate' , 
                               "[0,"+Rz*Rspeed*permaRdeficit+",0]");
               break;
                  
            case 3:      // key press/release event
               const value = e.data.getUint8(0);
               /*
                For my SpaceNavigator, a device having two (2) keys only:
                value is a 2-bit bitmask, allowing 4 key-states:
                value = 0: no keys pressed
                value = 1: left key pressed
                value = 2: right key pressed
                value = 3: both keys pressed
                */
               console.log("Left key " + ((value & 1) ? "pressed," : "released,") + "   Right key " + ((value & 2) ? "pressed, " : "released;"));
               break;
                  
            default:      // just in case a device exhibits unexpected capabilities  8-)
               console.log(e.device.productName + ": Received UNEXPECTED input report " + e.reportId);
               console.log(new Uint8Array(e.data.buffer));
            }
         }

         function ledOn() {
            const outputReportId = 4;
            const outputReport = Uint8Array.from([1]);
               
            device.sendReport(outputReportId, outputReport)
            .then(() => {
               console.log("Sent output report " + outputReportId + ": " + outputReport);
            })
            .catch(error => { console.error(error)
            })
         }

         function ledOff() {
            const outputReportId = 4;
            const outputReport = Uint8Array.from([0]);
               
            device.sendReport(outputReportId, outputReport)
            .then(() => {
               console.log("Sent output report " + outputReportId + ": " + outputReport);
            })
            .catch(error => { console.error(error)
            })
         }

         // Update translation sliders
         function updateTranslationSliders(Tx, Ty, Tz) {
            document.getElementById('translationX').value = Tx;
            document.getElementById('translationY').value = Ty;
            document.getElementById('translationZ').value = Tz;
         }

         // Update rotation sliders
         function updateRotationSliders(Rx, Ry, Rz) {
            document.getElementById('rotationX').value = Rx;
            document.getElementById('rotationY').value = Ry;
            document.getElementById('rotationZ').value = Rz;
         }

         // Update translation X slider
         function updateTranslationX(value) {
            // You can perform additional actions if needed
            console.log('Translation X:', value);
         }

         // Update translation Y slider
         function updateTranslationY(value) {
            // You can perform additional actions if needed
            console.log('Translation Y:', value);
         }

         // Update translation Z slider
         function updateTranslationZ(value) {
            // You can perform additional actions if needed
            console.log('Translation Z:', value);
         }

         // Update rotation X slider
         function updateRotationX(value) {
            // You can perform additional actions if needed
            console.log('Rotation X:', value);
         }

         // Update rotation Y slider
         function updateRotationY(value) {
            // You can perform additional actions if needed
            console.log('Rotation Y:', value);
         }

         // Update rotation Z slider
         function updateRotationZ(value) {
            // You can perform additional actions if needed
            console.log('Rotation Z:', value);
         }
