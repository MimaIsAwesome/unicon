let uniqueId = generateUniqueId();

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
let FPS = 25;

const fpsInput = document.getElementById("fps");

// Add an event listener to listen for changes
fpsInput.addEventListener("input", function() {
    // Update const FPS with the value from the input field
    FPS = parseInt(this.value);
    document.getElementById("fpsValue").textContent = this.value;
});


// Check for connected gamepads initially


let Tspeed = 1;
const tspeedInput = document.getElementById("tSpeed");
tspeedInput.addEventListener("input", function() {
    // Update const speed with the value from the input field
    Tspeed = parseFloat(this.value);
    document.getElementById("tSpeedValue").textContent = this.value;
});

let Rspeed = 1;
const rspeedInput = document.getElementById("rSpeed");
rspeedInput.addEventListener("input", function() {
    // Update const speed with the value from the input field
    Rspeed = parseFloat(this.value);
    document.getElementById("rSpeedValue").textContent = this.value;
});


function generateUniqueId() {
  const randomNumber = Math.floor(Math.random() * 1000000);
  const timestamp = new Date().getTime();
  const uniqueId = `${timestamp}_${randomNumber}`;
  return uniqueId;
}
var volumer = document.getElementById("volumer");
var vValue = document.getElementById("vValue");
var rollLine = document.getElementById("rollLine");
var rValue = document.getElementById("rValue");
var translateE = document.getElementById("translate");
var rotateE = document.getElementById("rotate");

var k1 = document.getElementById("k1");
var k3 = document.getElementById("k3");
var k4 = document.getElementById("k4");
var k5 = document.getElementById("k5");

var k13 = document.getElementById("k13");
var k17 = document.getElementById("k17");
// Function to handle MIDI messages/inputs
function onMIDIMessage(event) {
    let translate = null; 
    let rotate = null;
    var data = event.data;
    var status = data[0];
    var id = data[1]; 
    var value = data[2];
  
    if(status === 224 && id === 0){
      var zeroPoint = 64;
      var difference = value - zeroPoint;
      var clippedDifference = difference/10;
      translate = "[0,0,"+clippedDifference*Tspeed+"]"
      rollLine.style.transform = "translateY(" + difference*-1 + "px)";
      rValue.innerText = clippedDifference*Tspeed;
    }
    if(status === 191 && id === 20){
      var zeroPoint = 64;
      var difference = value - zeroPoint;
      var clippedDifference = difference/10;
      rotate = "[0,"+clippedDifference*Rspeed+",0]"
      volumer.style.transform = "rotate("+difference*2.5+"deg)";
      vValue.innerText = clippedDifference*Rspeed;
    }
    if(id === 11){
      if(status === 144){
        k1.style.background = "lightgray"; 
        translate = "[-1,0,0]"
      }else{
        k1.style.background = "white";
        translate = "[0,0,0]"
      }
    }
    if(id === 13){
      if(status === 144){
        k3.style.background = "lightgray"; 
        translate = "[0,0,"+-1*Tspeed+"]"
      }else{
        translate = "[0,0,0]"
        k3.style.background = "white";
      }
    }
    if(id === 14){
      if(status === 144){
        k4.style.background = "lightgray";
        translate = "[0,0,"+1*Tspeed+"]"
      }else{
        translate = "[0,0,0]"
        k4.style.background = "black";
      }
    }
    if(id === 15){
      if(status === 144){
        k5.style.background = "lightgray";
        translate = "["+1*Tspeed+",0,0]"
      }else{
        translate = "[0,0,0]"
        k5.style.background = "white";
      }
    }
    if(id === 23){
      if(status === 144){
        k13.style.background = "lightgray";
        rotate = "[0,"+-1*Rspeed+",0]"
      }else{
        k13.style.background = "white";
        rotate = "[0,0,0]"
      }
    }
    if(id === 27){
      if(status === 144){
        k17.style.background = "lightgray";
        rotate = "[0,"+1*Rspeed+",0]"
      }else{
        k17.style.background = "white";
        rotate = "[0,0,0]"
      }
    }
    if(translate)
      translateE.innerText = translate;
    if(rotate)
      rotateE.innerText = rotate;
  // console.log("rotate: " + rotate);
    if(avatarSelectedID && translate){
      client.publish('MimaDzp/Avatars/' + avatarSelectedID + '/translate' , translate)
    }
    if(avatarSelectedID && rotate){
      client.publish('MimaDzp/Avatars/' + avatarSelectedID + '/rotate' , rotate)
    }
}

var midiName = document.getElementById("controller");;

function onMIDISuccess(midiAccess) {
    console.log('MIDI Access granted');
    
    var inputs = midiAccess.inputs.values();
    
    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
        input.value.onmidimessage = onMIDIMessage;
        input.onstatechange = onMIDIStateChange;
        midiName.innerText = input.value.name;
    }
}

if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess()
        .then(onMIDISuccess)
        .catch(function(err) {
            midiName.innerText = "MIDI access request failed:"+ err;
        });
} else {
     midiName.innerText = 'Web MIDI not supported';
}

function onMIDIStateChange(event) {
    var midiConnection = event.target;
    if (midiConnection.state === "disconnected") {
        midiName.innerText = "MIDI device disconnected";
    }
}