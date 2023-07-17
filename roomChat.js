
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(express.json());
// Define the base URL
const baseUrl = 'http://192.168.29.131:4000';

// Load existing rooms from roomsStore.json file

app.use(cors({
    origin: '*',
    credentials: true,
}));
let rooms = [];
if (fs.existsSync('roomsStore.json')) {
    const roomsData = fs.readFileSync('roomsStore.json');
    rooms = JSON.parse(roomsData);
}



// Create Room

app.post('/rooms', upload.single('roomProfilePhoto'), (req, res) => {
    const { roomName, username, roomDescription } = req.body;
    const roomProfilePhoto = req.file.originalname;
    const createdDate = new Date().toISOString();
    const roomId = uuidv4();

    const newRoom = {
        roomId,
        roomName,
        username,
        createdDate,
        roomDescription,
        roomProfilePhoto,
        chat: [],
    };


    const filePath = path.join(__dirname, 'uploads', roomProfilePhoto);

    // Move the file to the designated folder
    fs.renameSync(req.file.path, filePath);


    rooms.push(newRoom);
    fs.writeFileSync('roomsStore.json', JSON.stringify(rooms));

    res.status(201).json({ success: true, message: 'Room created successfully' });
});


// Get all Rooms


app.get('/rooms', (req, res) => {
    const roomsWithPhotoUrl = rooms.map((room) => ({
        ...room,
        roomProfilePhotoUrl: room.roomProfilePhoto
            ? `${baseUrl}/uploads/${room.roomProfilePhoto}`
            : null,
    }));

    res.json({ success: true, rooms: roomsWithPhotoUrl });
});



// Get one Room


app.get('/rooms/:roomId', (req, res) => {
    const roomId = req.params.roomId;
    const room = rooms.find((room) => room.roomId === roomId);

    if (room) {
        const roomWithPhotoUrl = {
            ...room,
            roomProfilePhotoUrl: room.roomProfilePhoto
                ? `${baseUrl}/uploads/${room.roomProfilePhoto}`
                : null,
        };

        res.json({ success: true, room: roomWithPhotoUrl });
    } else {
        res.status(404).json({ success: false, message: 'Room not found' });
    }
});


// upade Room

// app.patch('/rooms/:roomId', upload.single('roomProfilePhoto'), (req, res) => {
//     const roomId = req.params.roomId;
//     const roomProfilePhoto = req.file ? req.file.originalname : null;

//     const room = rooms.find((room) => room.roomId === roomId);

//     if (room) {
//         if (roomProfilePhoto) {
//             // Update the room profile photo
//             const filePath = path.join(__dirname, 'uploads', roomProfilePhoto);

//             // Move the new profile photo to the designated folder
//             fs.renameSync(req.file.path, filePath);

//             // Remove the old profile photo if it exists
//             if (room.roomProfilePhoto) {
//                 const oldFilePath = path.join(__dirname, 'uploads', room.roomProfilePhoto);
//                 fs.unlinkSync(oldFilePath);
//             }

//             room.roomProfilePhoto = roomProfilePhoto;
//         }

//         // Update the roomsStore.json file
//         fs.writeFileSync('roomsStore.json', JSON.stringify(rooms));

//         res.json({ success: true, message: 'Room profile image updated successfully' });
//     } else {
//         res.status(404).json({ success: false, message: 'Room not found' });
//     }
// });


app.patch('/rooms/:roomId', upload.single('roomProfilePhoto'), (req, res) => {
    const roomId = req.params.roomId;
    const roomName = req.body.roomName;
    const roomDescription = req.body.roomDescription;
    const roomProfilePhoto = req.file ? req.file.originalname : null;

    const room = rooms.find((room) => room.roomId === roomId);

    if (room) {
        if (roomProfilePhoto) {
            // Update the room profile photo
            const filePath = path.join(__dirname, 'uploads', roomProfilePhoto);

            // Move the new profile photo to the designated folder
            fs.renameSync(req.file.path, filePath);

            // Remove the old profile photo if it exists
            if (room.roomProfilePhoto) {
                const oldFilePath = path.join(__dirname, 'uploads', room.roomProfilePhoto);
                fs.unlinkSync(oldFilePath);
            }

            room.roomProfilePhoto = roomProfilePhoto;
        }

        // Update roomName and roomDescription if provided
        if (roomName) {
            room.roomName = roomName;
        }
        if (roomDescription) {
            room.roomDescription = roomDescription;
        }

        // Update the roomsStore.json file
        fs.writeFileSync('roomsStore.json', JSON.stringify(rooms));

        res.json({ success: true, message: 'Room updated successfully' });
    } else {
        res.status(404).json({ success: false, message: 'Room not found' });
    }
});




// remove room


app.delete('/rooms/:roomId', (req, res) => {
    const roomId = req.params.roomId;

    const roomIndex = rooms.findIndex((room) => room.roomId === roomId);

    if (roomIndex !== -1) {
        // Remove the room from the rooms array
        const deletedRoom = rooms.splice(roomIndex, 1)[0];

        // Remove the room profile photo if it exists
        if (deletedRoom.roomProfilePhoto) {
            const filePath = path.join(__dirname, 'uploads', deletedRoom.roomProfilePhoto);
            fs.unlinkSync(filePath);
        }

        // Update the roomsStore.json file
        fs.writeFileSync('roomsStore.json', JSON.stringify(rooms));

        res.json({ success: true, message: 'Room removed successfully' });
    } else {
        res.status(404).json({ success: false, message: 'Room not found' });
    }
});







// Create Room Mesage Chat
// app.post('/rooms/:roomId/messages', upload.single('files'), (req, res) => {
//     const roomId = req.params.roomId;
//     const { sender, message } = req.body;
//     const sendDateTime = new Date().toISOString();
//     const files = req.file.originalname;
//     const messageId = uuidv4();


//     const room = rooms.find((room) => room.roomId === roomId);
//     const filePath = path.join(__dirname, 'uploads', files);

//     // Move the file to the designated folder
//     fs.renameSync(req.file.path, filePath);

//     if (room) {
//         const newMessage = {
//             messageId,
//             sender,
//             message,
//             sendDateTime,
//             files: `${baseUrl}/uploads/${files}`,
//         };
//         room.chat.push(newMessage);

//         fs.writeFileSync('roomsStore.json', JSON.stringify(rooms));
//         res.status(201).json({ success: true, message: 'Message sent successfully' });
//     } else {
//         res.status(404).json({ success: false, message: 'Room not found' });
//     }
// });





// app.post('/rooms/:roomId/messages', upload.array('files'), (req, res) => {
//     const roomId = req.params.roomId;
//     const { sender, message } = req.body;
//     const sendDateTime = new Date().toISOString();
//     const files = req.files;
//     const messageId = uuidv4();
//     var getFIlenaem;

//     const room = rooms.find((room) => room.roomId === roomId);




//     if (room) {
//         const uploadedFiles = files.map((file) => {
//             // const filePathr = path.join(__dirname, 'uploads',file.originalname );

//             // // Move the file to the designated folder
//             // fs.renameSync(req.file.path, filePathr); 


//             const { originalname: fileName, size: fileSize, mimetype: fileType } = file;
//             const filePath = file.path;

//             getFIlenaem = fileName;

//             return {
//                 fileName,
//                 fileSize,
//                 fileType,
//                 filePath,
//             }; 
//         });

//         const newMessage = {
//             messageId,
//             sender,
//             message,
//             sendDateTime,
//             files: uploadedFiles,
//             fileUrl: uploadedFiles == null || uploadedFiles == '' || uploadedFiles.length == 0 ? null : `${baseUrl}/uploads/${getFIlenaem}`,

//         };

//         room.chat.push(newMessage);

//         fs.writeFileSync('roomsStore.json', JSON.stringify(rooms));

//         res.status(201).json({ success: true, message: 'Message sent successfully' });
//     } else {
//         res.status(404).json({ success: false, message: 'Room not found' });
//     }
// });




app.post('/rooms/:roomId/messages', upload.array('files'), (req, res) => {
    const roomId = req.params.roomId;
    const { sender, message } = req.body;
    const sendDateTime = new Date().toISOString();
    const files = req.files;
    const messageId = uuidv4();

    const room = rooms.find((room) => room.roomId === roomId);

    if (room) {
        const uploadedFiles = files.map((file) => {
            const { originalname: fileName, size: fileSize, mimetype: fileType, filename: filePath } = file;
            const newFilePath = path.join(__dirname, 'uploads', fileName);

            fs.renameSync(`${__dirname}/uploads/${filePath}`, newFilePath);

            return {
                fileName,
                fileSize,
                fileType,
                filePath: fileName,
            };
        });

        const fileUrls = uploadedFiles.map((file) => `${baseUrl}/uploads/${file.fileName}`);
        
 
        const newMessage = {
            messageId,
            sender,
            message,
            sendDateTime,
            files: uploadedFiles,
            fileUrls,
        };

        room.chat.push(newMessage);

        fs.writeFileSync('roomsStore.json', JSON.stringify(rooms));

        res.status(201).json({ success: true, message: 'Message sent successfully' });
    } else {
        res.status(404).json({ success: false, message: 'Room not found' });
    }
});












// ROOMS MESAGGE get one
app.get('/rooms/:roomId/messages', (req, res) => {
    const roomId = req.params.roomId;
    const room = rooms.find((room) => room.roomId === roomId);

    if (room) {
        res.json({ success: true, messages: room.chat });
    } else {
        res.status(404).json({ success: false, message: 'Room not found' });
    }
});



// Update a room Measege by id

app.patch('/rooms/:roomId/messages/:messageId', upload.none(), (req, res) => {
    const roomId = req.params.roomId;
    const messageId = req.params.messageId;
    const message = req.body.message;

    const room = rooms.find((room) => room.roomId === roomId);

    if (room) {
        const messageToUpdate = room.chat.find((msg) => msg.messageId === messageId);

        if (messageToUpdate) {
            // Update the message content
            messageToUpdate.message = message;

            // Update the roomsStore.json file
            fs.writeFileSync('roomsStore.json', JSON.stringify(rooms));

            res.json({ success: true, message: 'Message updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Message not found' });
        }
    } else {
        res.status(404).json({ success: false, message: 'Room not found' });
    }
});

// Chat Remove

app.delete('/rooms/:roomId/messages/:messageId', (req, res) => {
    const roomId = req.params.roomId;
    const messageId = req.params.messageId;

    const room = rooms.find((room) => room.roomId === roomId);

    if (room) {
        const messageIndex = room.chat.findIndex((msg) => msg.messageId === messageId);

        if (messageIndex !== -1) {
            // Remove the message from the chat array
            room.chat.splice(messageIndex, 1);

            // Update the roomsStore.json file
            fs.writeFileSync('roomsStore.json', JSON.stringify(rooms));

            res.json({ success: true, message: 'Message removed successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Message not found' });
        }
    } else {
        res.status(404).json({ success: false, message: 'Room not found' });
    }
});



// Get room FIles 🔥

app.get('/rooms/:roomId/chat/files', (req, res) => {
    const roomId = req.params.roomId;
    const room = rooms.find((room) => room.roomId === roomId);

    if (room) {
        const chatFiles = room.chat.reduce((files, message) => {
            if (message.files && message.files.length > 0) {
                files.push(...message.files);
            }
            return files;
        }, []);

        const filesWithDetails = chatFiles.map((file) => ({
            fileName: file.fileName,
            fileSize: formatFileSize(file.fileSize),
            fileType: file.fileType,
        }));

        res.json({ success: true, files: filesWithDetails });
    } else {
        res.status(404).json({ success: false, message: 'Room not found' });
    }
});

function formatFileSize(fileSize) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = fileSize;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
}


 

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Start the server
app.listen(4000, () => {
    console.log('Server is running on http://localhost:3000');
});
