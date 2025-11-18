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

//Acgyrinfo
let translateTxt = document.getElementById("translate");
let rotateTxt = document.getElementById("rotate");
let i = 0;
var previousGamma = null; // Previous gamma value
var timeInterval = 0.1; // Time interval between samples in seconds (adjust as needed)
var totalLinearDistance = 0; // Total linear distance traveled
var velocity = 0; // Current velocity

        if (window.DeviceMotionEvent && window.DeviceOrientationEvent) {
            window.addEventListener('devicemotion', function(event) {
                var acceleration = event.acceleration; // Acceleration values
                var accelerationIncludingGravity = event.accelerationIncludingGravity; // Acceleration including gravity values
                //i++;
                var accelerationOutput = "Acceleration: ";
                if (acceleration) {
                  accelerationOutput += "x=" + acceleration.x.toFixed(2) + ", y=" + acceleration.y.toFixed(2) + ", z=" + acceleration.z.toFixed(2);
                  translateTxt.textContent = "["+acceleration.x.toFixed(2)*0.1 +","+ acceleration.y.toFixed(2)*-0.1 +","+acceleration.z.toFixed(2)*0.1+"]";
                  /*if(avatarSelectedID  && i == 5){
                    client.publish('MimaDzp/Avatars/' + avatarSelectedID + '/translate' , translateTxt.textContent);
                    i = 0;
                  }*/

                } else {
                    accelerationOutput += "No acceleration values found.";
                }

                document.getElementById("acceleration").textContent = accelerationOutput;
            });

            window.addEventListener('deviceorientation', function(event) {
                var alpha = event.alpha; // Compass direction in degrees
                var beta = event.beta; // Device's front-to-back tilt in degrees
                var gamma = event.gamma; // Device's left-to-right tilt in degrees
                //i++;
                if (gamma !== null) {
                    // Calculate angular velocity (change in gamma over time)
                    if (previousGamma !== null) {
                        var angularVelocity = (gamma - previousGamma) / timeInterval;

                        // Integrate angular velocity to obtain angular displacement
                        var angularDisplacement = angularVelocity * timeInterval;

                        // Convert angular displacement to linear displacement (for simplicity, assume radius = 1)
                        var linearDisplacement = Math.sin(gamma * Math.PI / 180) * angularDisplacement;

                        // Accumulate linear displacements to obtain total linear distance traveled
                        totalLinearDistance += Math.abs(linearDisplacement);

                        // Calculate velocity (linear displacement per second)
                        velocity = totalLinearDistance / timeInterval;
                    }

                    // Update previous gamma value for the next iteration
                    previousGamma = gamma;
                }
                if(avatarSelectedID /* && i == 5*/){
                    client.publish('MimaDzp/Avatars/' + avatarSelectedID + '/rotate' ,"[0,"+velocity+",0]");
                    //i = 0;
                }
                
                var output = "Gyroscope: ";
                
                if (alpha !== null && beta !== null && gamma !== null) {
                    //output += "alpha=" + alpha + ", beta=" + beta + ", gamma=" + gamma;
                  output += "velocity gama=" + velocity ;
                  if(avatarSelectedID  && i == 5){
                    client.publish('MimaDzp/Avatars/' + avatarSelectedID + '/translate' , translateTxt.textContent);
                    output += "velocity gama=" + velocity ;
                    i = 0;
                  }
                  
                } else {
                    output += "No gyroscope values found.";
                }
                
                document.getElementById("gyroscope").textContent = output;
                
                var compassOutput;
              
                if (alpha !== null) {
                   compassOutput = "Compass: " + alpha + " degrees";
                } else {
                   compassOutput = "Compass: Missing alpha from gyroscope";
                }
                document.getElementById("compass").textContent = compassOutput;
            });
        } else {
            document.getElementById("acceleration").textContent = "DeviceMotionEvent or DeviceOrientationEvent not supported.";
            document.getElementById("gyroscope").textContent = "DeviceMotionEvent or DeviceOrientationEvent not supported.";
            document.getElementById("compass").textContent = "DeviceMotionEvent or DeviceOrientationEvent not supported.";
        }


function transformTranslate(acceleration){
    var translate = [acceleration.x,acceleration.y,acceleration.z];
    let stringRepresentation = JSON.stringify(translate);
    return stringRepresentation;
}


function generateUniqueId() {
  const randomNumber = Math.floor(Math.random() * 1000000);
  const timestamp = new Date().getTime();
  const uniqueId = `${timestamp}_${randomNumber}`;
  return uniqueId;
}