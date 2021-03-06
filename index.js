
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const database = require('./database.js');
const verify = require('./verify');
const constants = require('./constants.js');
const moment = require('moment');

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

require('colors');
require('./authServer.js');

let insertMode = false;

const idMachine = constants.idMachine;

const portNfc = new SerialPort(constants.nfcPort, {
    baudRate: 9600
});

const parserNfc = portNfc.pipe(new Readline({
    delimiter: '\n'
}));


const portLcd = new SerialPort(constants.lcdPort, {
    baudRate: 9600
});

// Response Object
function Response(rfid, date, hour, weekDay, idMachine) {
    this.rfid = rfid;
    this.date = date;
    this.hour = hour;
    this.weekDay = weekDay;
    this.idMachine = idMachine;
}

http.listen(3002, function(){
    console.log('socket listening on *:3002');
});

io.on('connection', function(socket){
    console.log('a user connected');
});

// Reading the port data:
portNfc.on('open', () => {
    console.log('[serialport] Serial Port NFC Opening' .cyan);
});

portLcd.on('open', () => {
    console.log('[serialport] Serial Port LCD Opening' .cyan);
});

// Read the data of the rfid:
parserNfc.on('data', async function (rfid) {

    rfid = rfid.trim();

    moment.locale('es');

    let date = moment().format("YYYY-DD-MM");
    let hour = moment().format("HH:mm:ss");
    let weekDay = moment().format("dddd");

    let responseObj = new Response(rfid, date, hour, weekDay, idMachine);

    database.saveSignin(responseObj);
    console.log(responseObj);
    let isVerified = await verify.verifyRFID(responseObj);
   
    sendToArduino(isVerified,rfid);
    
    console.log(JSON.stringify(responseObj));

});

function sendToArduino(isVerified,rfid) {

   
    //Si esta en mode inserció enviam el codi rfid a la vista
    if (insertMode && isVerified != 2) {
        portNfc.write('1');
        portLcd.write(rfid+"-Mode insercio");
        io.emit('rfid', rfid);

    //Activam el mode insercio amb la targeta "admin"
    } else if (!insertMode && isVerified == 2) {
        insertMode = true;
        portNfc.write('2');
        portLcd.write(rfid+"-Mode insercio");

    //Desactivam mode insercio amb la targeta "admin"
    } else if (insertMode && isVerified == 2) {
        insertMode = false;
        portNfc.write('2');
        portLcd.write("Fi Mode insercio");
 
    //Si el mode insercio esta desactivat i reb una targeta normal
    //s'efectuara el fichatge normal
    } else {
        if (isVerified == 1) {
            portNfc.write('1');
        } else {
            portNfc.write('0');
        }
        portLcd.write(rfid);

    }
    console.log('[serialport] Sending info out of the serial port' .cyan);
}
