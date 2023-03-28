const express = require('express');
const cors = require('cors');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const port = 3000;

app.use(express.urlencoded({extended : true}));
app.use(
    cors({
        origin : '*',
        methods : ['GET', 'POST', 'PUT', 'DELETE'],
        allowHeaders : ['Content-Type']
    })
);

app.listen(port);


app.post('/genTxnId', (req, res)=>{
    let consumerName = req.body.name;
    let consumerId = req.body.uid;
    let date = moment().format('DD-MM-YYYY');
    let time = moment().format('HH:MM:SS');
    let txnId = `${consumerName}${consumerId}${date}${time}`.toString().replaceAll(" ", "").replaceAll("-", "").replaceAll(":", "");
    res.send(txnId);
})

app.post('/genHash', (req, res)=>{
    let salt = '9204754820OCADIJ';
    let data = req.body.plainPass.concat(salt);
    let hash = crypto.createHash('sha512', salt).update(data).digest('hex');
    res.send(hash);
})

app.post('/request', (req, res)=>{
    let requestData = req.body.data.toString();
    let fileName = (JSON.parse(requestData).txnId).toString() + '.txt';
    console.log(fileName);
    // fs.writeFile(fileName, requestData,(err)=>{
    //     if (err) throw err
    //     else{
    //         console.log('file created successfully');
    //     }
    // })
    res.send('1');
})

app.post('/response', (req, res)=>{
    let salt = '9204754820OCADIJ';
    let responseData = req.body.msg.toString();
    // console.log(responseData);
    let parsedData = responseData.split('|');
    // console.log(parsedData[15]);
    let fileName = parsedData[3]+'.txt';
    console.log(fileName);
    let responseHash = parsedData[15];
    
    let hashString = parsedData[0] + '|' + parsedData[1]+ '|' + parsedData[2] + '|' + parsedData[3] + '|' +
    parsedData[4] + '|' + parsedData[5] + '|' + parsedData[6] + '|' + parsedData[7] + '|' + parsedData[8] + 
    '|' + parsedData[9] + '|' + parsedData[10] + '|'+ parsedData[11] + '|' + parsedData[12] + '|' +
    parsedData[13] + '|' + parsedData[14]+'|' + salt;
    
    // console.log(hashString);
    let newHash = crypto.createHash('sha512', salt).update(hashString).digest('hex'); 
    // console.log(newHash);
    if(newHash == responseHash){
        console.log('verification successful');
    }
    fs.appendFile(fileName, '   Response:    ' ,(err)=>{
        if (err) throw err
    })
    fs.appendFile(fileName, responseData ,(err)=>{
        if (err) throw err
    })
})