

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(cors({
  origin:'*',
   credentials:true,
}));

// var baseUrl="https://chat-backend-r3hq.onrender.com";

var port=4000;
var baseUrl=`http://192.168.29.131:${port}`; 
 

// Message model
const messages = [];

 



// indro website


app.use(express.static(__dirname + '/indroweb/assets'));
app.use(express.static(__dirname + '/indroweb/assets'));

app.get('/', (req, res) => {


  console.log(__dirname)

  res.sendFile(`${__dirname}/indroweb/apidetals.html`)

});

 

const messagesFilePath = path.join(__dirname, 'messages.json');
app.post('/messages', upload.single('file'), (req, res) => {
  const senderName = req.body.senderName;
  const message = req.body.message; 
  const file = req.file;

  let fileUrl = null;

  if (file) {
    // Generate a unique filename
    const fileName = `${Date.now()}_${file.originalname}`;
    const filePath = path.join(__dirname, 'uploads', fileName);

    // Move the file to the designated folder
    fs.renameSync(file.path, filePath);

    // Set the file URL
    fileUrl = `${baseUrl}/files/${fileName}`;
  }

  // Create a new message object
  const newMessage = {
    senderName, 
    sendDateTime: new Date(),
    message,
    fileUrl,
  };

  // Read the existing messages from the file
  let messages = [];
  try {
    const messagesData = fs.readFileSync(messagesFilePath);
    messages = JSON.parse(messagesData);
  } catch (error) {
    console.log(`Error reading messages file: ${error}`);
  }

  // Add the new message to the array of messages
  messages.push(newMessage);

  // Write the messages back to the file
  try {
    fs.writeFileSync(messagesFilePath, JSON.stringify(messages));
  } catch (error) {
    console.log(`Error writing messages file: ${error}`);
  }

  res.json(newMessage);
});
 
// GET /messages - Retrieve all messages
app.get('/messages', (req, res) => {
  let messages = [];
  try {
    const messagesData = fs.readFileSync(messagesFilePath);
    messages = JSON.parse(messagesData);
  } catch (error) {
    console.log(`Error reading messages file: ${error}`);
  }
  res.json(messages);
});

// Serve static files from the uploads folder
app.use('/files', express.static('uploads'));

// Start the server
app.listen(port, () => {
  console.log('Server started on port 3000');
});

