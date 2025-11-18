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

// HANDLING MOUSE ROTATION
const innerDot1 = document.getElementById('inner-circle1');
const innerDot2 = document.getElementById('inner-circle2');

let RX = document.getElementById("RX");
let RY = document.getElementById("RY");
let RpX = document.getElementById("RpX");
let RpY = document.getElementById("RpY");

    let lastMouseX = null;
    let lastMouseY = null;
    let mouseVelocityX = 0;
    let mouseVelocityY = 0;
    let is_reseted = false;
    let diff = 0;

    function handleMouseMove(event) {
      if (lastMouseX !== null && lastMouseY !== null) {
        // Calculate velocity based on change in position
        mouseVelocityX = event.clientX - lastMouseX;
        mouseVelocityY = event.clientY - lastMouseY;
      }

      // Store current mouse position
      lastMouseX = event.clientX;
      lastMouseY = event.clientY;
      
        // mouseVelocityX = mouseVelocityX *0.1
        var fixedX = (mouseVelocityX*Rspeed).toFixed(2);
        var rotate = "[ 0, "+ fixedX*Rspeed +", 0 ]";
        if(client && avatarSelectedID){
            console.log(rotate);
            client.publish('MimaDzp/Avatars/' + avatarSelectedID + '/rotate' , rotate);
        };
        RX.innerText = "RX: " +mouseVelocityX;
        RY.innerText = "RY: " +mouseVelocityY;
        RpX.innerText = lastMouseX;
        RpY.innerText = lastMouseX;
        innerDot1.style.transform = `translate(-50%, -50%) translate(${mouseVelocityX}px, ${mouseVelocityY}px)`;
        innerDot2.style.transform = `translate(-50%, -50%) translate(${lastMouseX/15}px, ${lastMouseY/15}px)`;
        is_reseted = false;
    }

    function resetMouseVelocity() {
      if(client && avatarSelectedID){
          client.publish('MimaDzp/Avatars/' + avatarSelectedID + '/rotate' , "[ 0, 0, 0 ]");
      };
      mouseVelocityX = 0;
      mouseVelocityY = 0;
      RX.innerText = "RX: " +mouseVelocityX;
      RY.innerText = "RY: " +mouseVelocityY;
      RpX.innerText = ""+ lastMouseX;
      RpY.innerText = ""+ lastMouseX;
      innerDot1.style.transform = `translate(-50%, -50%) translate(${mouseVelocityX}px, ${mouseVelocityY}px)`;
      is_reseted = true;
      
    }

setInterval(() => {
  if (!is_reseted && diff == 0) {
    resetMouseVelocity();
  }
}, 100);

function difference(event) {
    diff = event.clientX - lastMouseX;
}

let listenMouse = false; 
const listenButton = document.getElementById('listenButton');
listenButton.addEventListener('click', function() {
  listenMouse = !listenMouse;
  if(listenMouse){
    listenButton.textContent = "Listening Mouse Inputs..."; 
    document.addEventListener('mousemove', handleMouseMove, difference);
    document.addEventListener('mouseout', resetMouseVelocity);
    document.addEventListener('mouseleave', resetMouseVelocity);
    listenButton.text
  }else{
    listenButton.textContent = "Listen Mouse Inputs"; 
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseout', resetMouseVelocity);
    document.removeEventListener('mouseleave', resetMouseVelocity);
  }
  
});

// HANDLING MOUSE ROTATION-------------

// KEYBOARD EVENTS
let x = 0;
let z = 0;

let translate = document.getElementById("translate");
let up_ar = document.getElementById("b69");
let down_ar = document.getElementById("b82");
let left_ar = document.getElementById("b81");
let right_ar = document.getElementById("b83");
let w_ar = document.getElementById("b23");
let s_ar = document.getElementById("b43");
let a_ar = document.getElementById("b42");
let d_ar = document.getElementById("b44");

document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowUp') {
        up_ar.style.background = "gray"; 
        z = 1;
    }
    if (event.key === 'ArrowDown' ) {
        down_ar.style.background = "gray"; 
        z = -1;
    }
    if (event.key === 'ArrowLeft') {
        left_ar.style.background = "gray"; 
        x = -1;
    }
    if (event.key === 'ArrowRight') {
        right_ar.style.background = "gray"; 
        x = 1;
    }
    if (event.key === 'w') {
        w_ar.style.background = "gray"; 
        z = 1;
    }
    if (event.key === 's' ) {
        s_ar.style.background = "gray"; 
        z = -1;
    }
    if (event.key === 'a') {
        a_ar.style.background = "gray"; 
        x = -1;
    }
    if (event.key === 'd') {
        d_ar.style.background = "gray"; 
        x = 1;
    }
    translate.innerText = "["+x+",0,"+z+"]";
    if(avatarSelectedID){
            client.publish('MimaDzp/Avatars/' + avatarSelectedID + '/translate' , "["+x*Tspeed+",0,"+z*Tspeed+"]");
    };
});

document.addEventListener('keyup', function(event) {
  
    if (event.key === 'ArrowUp') {
        up_ar.style.background = "white";
        z = 0;
    }
    if (event.key === 'ArrowDown') {
        down_ar.style.background = "white"; 
        z = 0;
    }
    if (event.key === 'ArrowLeft') {
        left_ar.style.background = "white"; 
        x = 0;
    }
    if (event.key === 'ArrowRight') {
        right_ar.style.background = "white"; 
        x = 0;
    }
    if (event.key === 'w') {
        w_ar.style.background = "white";
        z = 0;
    }
    if (event.key === 's') {
        s_ar.style.background = "white"; 
        z = 0;
    }
    if (event.key === 'a') {
        a_ar.style.background = "white"; 
        x = 0;
    }
    if (event.key === 'd') {
        d_ar.style.background = "white"; 
        x = 0;
    }
    translate.innerText = "["+x*Tspeed+",0,"+z*Tspeed+"]";
    if(avatarSelectedID){
            client.publish('MimaDzp/Avatars/' + avatarSelectedID + '/translate' , "["+x+",0,"+z+"]" );
    };
});

// KEYBOARD EVENTS ------------------