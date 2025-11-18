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

var transButt = document.querySelector('.transButt');
var skeleButt = document.querySelector('.skeleButt');
var buttonToggleInstr = document.getElementById("toggleInstr");

var toggle = true; 
document.getElementById("toggleInstr").addEventListener("click", function() {
  if(toggle){
    transButt.style.display = 'none';
    skeleButt.style.display = 'block';
    buttonToggleInstr.textContent = "Skeleton";
    toggle = false;
  }else{
    transButt.style.display = 'block';
    skeleButt.style.display = 'none';
    buttonToggleInstr.textContent = "Transformations";
    toggle = true;
  }
});

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

let previousAxes = [0, 0, 0, 0]; // Initialize with default values
let controllerInfo = document.getElementById("controller");
let intervalId; // Variable to store interval ID
// Function to check for connected gamepads
function checkGamepads() {
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
        const gamepad = gamepads[i];
        if (gamepad && gamepad.id === "Xbox 360 Controller (XInput STANDARD GAMEPAD)") {
            console.log(gamepads);
            const interval = 1000 / FPS; // Calculate the interval in milliseconds
            controllerInfo.textContent = gamepad.id;
              updateAxes(gamepad);
              updateArrowButtons(gamepad);
            clearInterval(intervalId); // Stop the interval
            break; // Exit loop once Xbox 360 Controller is found
        }
    }
}

// Check for connected gamepads initially
checkGamepads();

// Check for connected gamepads periodically
intervalId = setInterval(checkGamepads, 1000); // Store the interval ID for later use

var HL = document.getElementById('HandLeft');
var WL = document.getElementById('WristLeft');
var EL = document.getElementById('ElbowLeft');
var SL = document.getElementById('ShoulderLeft');

var SR = document.getElementById('ShoulderRight');
var ER = document.getElementById('ElbowRight');
var WR = document.getElementById('WristRight');
var HR = document.getElementById('HandRight');

function updateArrowButtons(gamepad) {
    const buttonState = gamepad.buttons; // Get the state of all buttons
    // Define the button IDs for your HTML buttons
    const buttonIDs = ["b1", "b2", "b3", "b4", "b5", "b6", "b7","b8", "b9", "b10", "b11", 
                       "b12", "b13", "b14", "b15", "b16", "b17"]; // Assuming b1, b2, b3, b4 are the IDs of your HTML buttons
    
    // Iterate through each button state
    buttonState.forEach((button, index) => {
      if(toggle){
        if (button.value > 0.5) {
            // Change the background color of the corresponding HTML button
            document.getElementById(buttonIDs[index]).style.backgroundColor = "gray";
        } else {
            // Reset the color of the corresponding HTML button
            document.getElementById(buttonIDs[index]).style.backgroundColor = "white";
        }
      }else{
        if(index == 14){
          if(button.value > 0.5)
            ResetColor("HandLeft");
        }
        if(index == 12){
          if(button.value > 0.5)
            ResetColor("WristLeft");
        }
        if(index == 13){
          if(button.value > 0.5)
            ResetColor("ElbowLeft");
        }
        if(index == 15){
          if(button.value > 0.5)
            ResetColor("ShoulderLeft");
        }
        
        if(index == 1){
          if(button.value > 0.5)
            ResetColor("HandRight");
        }
        if(index == 3){
          if(button.value > 0.5)
            ResetColor("WristRight");
        }
        if(index == 0){
          if(button.value > 0.5)
            ResetColor("ElbowRight");
        }
        if(index == 2){
          if(button.value > 0.5)
            ResetColor("ShoulderRight");
        }
        
      }
      
      
    });
}


var TX = document.getElementById('TX');
var TY = document.getElementById('TY');
var RX = document.getElementById('RX');
var RY = document.getElementById('RY');

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
    Tspeed = parseFloat(this.value);
    document.getElementById("rSpeedValue").textContent = this.value;
});

function updateAxes(gamepad) {
    updateArrowButtons(gamepad);
    const x1 = gamepad.axes[0] * 90; // Scale the values to fit within the container
    const y1 = gamepad.axes[1] * 90;
    const x2 = gamepad.axes[2] * 90; // Scale the values to fit within the container
    const y2 = gamepad.axes[3] * 90;

    // Check if axes have changed
    if (x1 !== previousAxes[0] || y1 !== previousAxes[1] || x2 !== previousAxes[2] || y2 !== previousAxes[3]) {
        const innerCircle1 = document.getElementById("b11");
        const innerCircle2 = document.getElementById("b12");
        innerCircle1.style.transform = `translate(-50%, -50%) translate(${x1}px, ${y1}px)`;
        innerCircle2.style.transform = `translate(-50%, -50%) translate(${x2}px, ${y2}px)`;
        TX.innerText = "TX: " + gamepad.axes[0].toFixed(2)*(1);
        TY.innerText = "TY: " +gamepad.axes[1].toFixed(2)*(-1);
        RX.innerText = "RX: " +gamepad.axes[2].toFixed(2)*(1);
        RY.innerText = "RY: " +gamepad.axes[3].toFixed(2)*(-1);
        // Publish the changes
        if(avatarSelectedID){
          if(toggle){
            client.publish('MimaDzp/Avatars/' + avatarSelectedID + '/translate' , transformTranslate(gamepad.axes[0], gamepad.axes[1]*(-1)));
            client.publish('MimaDzp/Avatars/' + avatarSelectedID + '/rotate' , transformRotate(gamepad.axes[2], gamepad.axes[3]*(-1)));
          }else{
            if(DefaultSkeleton[selectedBone]){
              DefaultSkeleton[selectedBone].x = DefaultSkeleton[selectedBone].x + gamepad.axes[0].toFixed(2)*(1);
              DefaultSkeleton[selectedBone].y = DefaultSkeleton[selectedBone].y + gamepad.axes[1].toFixed(2)*(-1);
              DefaultSkeleton[selectedBone].y = DefaultSkeleton[selectedBone].z + gamepad.axes[2].toFixed(2)*(1);
              
              const skeletonJsonString = JSON.stringify(DefaultSkeleton);
              client.publish('MimaDzp/KinectData/' , skeletonJsonString);
            }
          }
        }

        // Update previous axes values
        previousAxes = [x1, y1, x2, y2];
    }

    // Schedule the next update
    setTimeout(() => {
        requestAnimationFrame(() => updateAxes(navigator.getGamepads()[gamepad.index]));
    }, 1000 / FPS);
}      


function transformTranslate(x,y){
    var translate = "[ "+x.toFixed(2)*Tspeed+", 0,"+y.toFixed(2)*Tspeed+"]";
    let stringRepresentation = JSON.stringify(translate);
    return translate;
}


function transformRotate(x,y){
    var translate = "[ 0, "+x.toFixed(2)*Rspeed+", 0 ]";
    let stringRepresentation = JSON.stringify(translate);
    return translate;
}

function generateUniqueId() {
  const randomNumber = Math.floor(Math.random() * 1000000);
  const timestamp = new Date().getTime();
  const uniqueId = `${timestamp}_${randomNumber}`;
  return uniqueId;
}

var HL = document.getElementById('HandLeft');
var WL = document.getElementById('WristLeft');
var EL = document.getElementById('ElbowLeft');
var SL = document.getElementById('ShoulderLeft');

var SR = document.getElementById('ShoulderRight');
var ER = document.getElementById('ElbowRight');
var WR = document.getElementById('WristRight');
var HR = document.getElementById('HandRight');

//SKELETAL MOVEMENT
let HandArray = [HL, WL, EL, SL, SR, ER, WR, HR]
let selectedBone; 

function ResetColor(id){
    HandArray.forEach(function(element) {
      console.log(id);
      console.log(element.id);
    if(id.includes(element.id)){
      selectedBone = element.id;
      document.getElementById(element.id).style.backgroundColor = "gray";
    }else{
      document.getElementById(element.id).style.backgroundColor = "white";
    }
    });

}

const DefaultSkeleton = {
    SpineBase: { "x":-1.8798, "y": -7.4646, "z":27.1704},  
    SpineMid: { "x":-2.08, "y": -5.2661, "z":27.4873},   
    Neck : { "x":-2.6852, "y": -3.5069, "z":27.9852},   
    ShoulderLeft: { "x":-2.08, "y": -5.2661, "z":27.4873},
    ElbowLeft: { "x":-2.8572, "y": -5.9849, "z":27.5334},
    WristLeft : { "x":-3.2736, "y": -8.7292, "z":28.2507},
    HandLeft : { "x":-3.0141, "y": -7.1894, "z":26.5909},
    ShoulderRight : { "x":-2.08, "y": -5.2661, "z":27.4873},
    ElbowRight : { "x":-0.8757, "y": -5.1695, "z":26.3499},
    WristRight : { "x":-1.0479, "y": -6.7839, "z":24.6056},
    HandRight : { "x":-3.4778, "y": -7.1218, "z":24.215},
    HipLeft : { "x":-1.6063, "y": -10.4385, "z":26.6285},
    KneeLeft : { "x":-2.2925, "y": -10.5363, "z":27.096},
    AnkleLeft : { "x":-4.1823, "y": -10.4233, "z":25.041},
    FootLeft : { "x":-3.6018, "y": -13.4465, "z":24.7023},
    HipRight : { "x":-1.6063, "y": -10.4385, "z":26.6285},
    KneeRight : { "x":-0.8562, "y": -10.0971, "z":25.4794},
    AnkleRight : { "x":-1.5045, "y": -10.5639, "z":22.7203},
    FootRight : { "x":-0.2455, "y": -13.0781, "z":21.6862},
    SpineShoulder : { "x":-2.1455, "y": -4.5374, "z":27.5556},
    HandTipLeft : { "x":-3.1484, "y": -6.7016, "z":25.7653},
    ThumbLeft : { "x":-3.1484, "y": -6.7016, "z":25.7653},
    HandTipRight : { "x":-3.8237, "y": -6.9504, "z":24.0241},
    ThumbRight : { "x":-3.8237, "y": -6.9504, "z":24.0241}
};


