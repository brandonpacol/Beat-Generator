if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;
var bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
app.use(fileUpload());

// create application/json parser
var jsonParser = bodyParser.json();

app.use(express.static('public'))
app.use('/media', express.static('media'));


app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`)
})

app.post('/getMidi', jsonParser, (req, res) => {
    const body = req.body;
    const drum = body.drum;
    const directory = '/media/midis/' + drum + '/';
    const mediaPath = path.join(__dirname, directory);
    fs.readdir(mediaPath, (err, files) => {
        if (err) {
            console.log('Unable to scan directory: ' + err);
            res.end();
        } else {
            let max = files.length - 1;
            let min = 0;
        
            let index = Math.round(Math.random() * (max - min) + min);
            let file = files[index];

            res.json({ "midi" : directory + file });
        }    
    })
})

app.post('/getSamples', jsonParser, (req, res) => {
    const body = req.body;
    const drum = body.drum;
    const directory = '/media/samples/' + drum + '/';
    const mediaPath = path.join(__dirname, directory);
    let sampleArray = [];
    fs.readdir(mediaPath, (err, files) => {
        if (err) {
            console.log('Unable to scan directory: ' + err);
            res.end();
        } else {
            files.forEach((file) => {
                if (!file.startsWith('.')) {
                    sampleArray.push(file);
                }
            })
            res.json(sampleArray);
            res.end();
        }    
    })
})

app.post('/kickUpload', (req, res) => {
    if (req.files) {
        let sampleFile = req.files.kick;
        let uploadPath = __dirname + '/public/uploads/' + sampleFile.name;
        sampleFile.mv(uploadPath);
        console.log('uploaded kick')
    } else {
        console.log('error uploading')
    }
    res.end();
})

app.post('/snareUpload', (req, res) => {
    if (req.files) {
        let sampleFile = req.files.snare;
        let uploadPath = __dirname + '/public/uploads/' + sampleFile.name;
        sampleFile.mv(uploadPath);
        console.log('uploaded Snare')
    } else {
        console.log('error uploading')
    }
    res.end();
})

app.post('/hatUpload', (req, res) => {
    if (req.files) {
        let sampleFile = req.files.hat;
        let uploadPath = __dirname + '/public/uploads/' + sampleFile.name;
        sampleFile.mv(uploadPath);
        console.log('uploaded Hat')
    } else {
        console.log('error uploading')
    }
    res.end();
})

//page calls
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
})