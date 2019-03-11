var io = require('socket.io-client');
var socket = io.connect('http://localhost:80');


//console.log("starting");

var status = {
  gamepad: {
    drive: 0,
    strafe: 0,
    rotate: 0,
    upDown: 0,
    tilt: 0,
    XButton: false,
    fineControlToggle: false
  },
  profile: {
    HFL: 0,
  },
  thrust: {
    HFL: 0,
    HFR: 0,
    HRL: 0,
    HRR: 0,
    VL: 0,
    VR: 0,
    fineCoarse: true,
    direction: 1,
    error: ["null","null","null"]
  },
  manipulator: {
    EM1: {
      left: false,
      right: false,
    },
    EM2: {
      left: false,
      right: false,
    },
    DTMFencoder: 0    //0: not playing, 1: playing
  },
  depth: {
    raw: 0,
    mBar: 0,
    cm: 0,
    cmTared: 0,
    tare: 0,
    zero: 0,
  },
  video: {
    ch1: true,
    ch2: true,
    ch3: true,
  },
  pinger: {
    pinVoltage: 0,
    sourceVoltage: 0,
    error: ["null","null","null"]
  },
  echoer: {
    roundTime: 0,
    error: ["null","null","null"]
  },
  misc: {
    error: ["null","null","null"]
  },
  message: [],
  initiationTime: new Date()
};

socket.on('drive', function(value) {
  status.gamepad.drive = value;
});

socket.on('strafe', function(value) {
  status.gamepad.strafe = value;
});

socket.on('rotate', function(value) {
  status.gamepad.rotate = value;
});

socket.on('upDown', function(value) {
  status.gamepad.upDown = value;
});

socket.on('tilt', function(value) {
  status.gamepad.tilt = value;
});

/*
socket.on('thrusterTarget.HRR', function(_thrust) {
  status.profile.HRR = _thrust;
});
*/


socket.on('thruster.thrust.HFL', function(_thrust) {
  status.thrust.HFL = _thrust;
});

socket.on('thruster.thrust.HFR', function(_thrust) {
  status.thrust.HFR = _thrust;
});

socket.on('thruster.thrust.HRL', function(_thrust) {
  status.thrust.HRL = _thrust;
});

socket.on('thruster.thrust.HRR', function(_thrust) {
  status.thrust.HRR = _thrust;
});



socket.on('thruster.thrust.VF', function(_thrust) {
  status.thrust.VF = _thrust;
});

socket.on('thruster.thrust.VR', function(_thrust) {
  status.thrust.VR = _thrust;
});



socket.on('profile.direction', function(_direction) {
  status.thrust.direction = _direction;
});

socket.on('profile.fineCoarse', function(_fineCoarse) {
  status.thrust.fineCoarse = _fineCoarse;
});



socket.on('CAM.ch1', function(_channel) {
  status.video.ch1 = _channel;
})

socket.on('CAM.ch2', function(_channel) {
  status.video.ch2 = _channel;
})

socket.on('CAM.ch3', function(_channel) {
  status.video.ch3 = _channel;
})



socket.on('EM1', function(_EM1) {
  status.manipulator.EM1.left = _EM1.booleanLeft;
  status.manipulator.EM1.right = _EM1.booleanRight;
});


socket.on('pingerSourceVoltage', function(_sourceVoltage) {
  status.pinger.sourceVoltage = _sourceVoltage;
})

socket.on('echoerRoundTime', function(_roundTime) {
  status.echoer.roundTime = _roundTime;
})

socket.on('initiationTime', function(_time) {
  status.initiationTime = _time;
})


var pingerErrorArrMax = 2;    //stores how many error messages +1
var pingerErrorNum = 0;
socket.on('pingerError', function(_error) {
  pingerErrorNum++;
  status.pinger.error.shift();
  status.pinger.error[pingerErrorArrMax] = _error + "\t" + runTime() + "   Num: " + pingerErrorNum;
})


var echoerErrorArrMax = 2;    //stores how many error messages +1
var echoerErrorNum = 0;
socket.on('echoerError', function(_error) {
  echoerErrorNum++;
  status.echoer.error.shift();
  status.echoer.error[echoerErrorArrMax] = _error + "\t" + runTime() + "   Num: " + echoerErrorNum;
})


var thrustErrorArrMax = 2;    //stores how many error messages +1
var thrustErrorNum = 0;
socket.on('thrustError', function(_error) {
  thrustErrorNum++;
  status.thrust.error.shift();
  status.thrust.error[thrustErrorArrMax] = _error + "\t" + runTime() + "   Num: " + thrustErrorNum;
})


var miscErrorArrMax = 2;    //stores how many error messages +1
var miscErrorNum = 0;
socket.on('miscError', function(_error) {
  miscErrorNum++;
  status.misc.error.shift();
  status.misc.error[miscErrorArrMax] = _error + "\t" + runTime() + "   Num: " + miscErrorNum;
})



var CLI         = require('clui'),
    clc         = require('cli-color'),
    Line        = CLI.Line,
    LineBuffer  = CLI.LineBuffer,
    clear       = CLI.Clear,
    Gauge       = CLI.Gauge;

var gaugeArr = [];
var drawTimeout;

function gaugeLine(outputBuffer, name, value) {
  if(isNaN(value) || value == null) value = 0;
  return new Line(outputBuffer)
    .column(name, 13)
    .column(Gauge(value + 1, 2, 40, 2, value.toFixed(3)),80)
    .fill()
    .store();
}

function booleanLine(outputBuffer, name, nameWidth, value, _true, _false) {
  var line = new Line(outputBuffer)
    .column(name, nameWidth)
    .column(value == 1?  _true : _false ,50)
    .fill()
    .store();
}

function draw() {
  var outputBuffer = new LineBuffer({
    x: 0,
    y: 0,
    width: 80,
    height: 40
  });

  var outputBuffer = new LineBuffer({
    x: 0,
    y: 0,
    width: 'console',
    height: 'console'
  });

  var gaugeWidth = 30;

  gaugeLine(outputBuffer, "Drive", status.gamepad.drive);

  gaugeLine(outputBuffer, "Strafe", status.gamepad.strafe);

  gaugeLine(outputBuffer, "Rotate", status.gamepad.rotate);

  gaugeLine(outputBuffer, "upDown", status.gamepad.upDown);

  gaugeLine(outputBuffer, "tilt", status.gamepad.tilt);

  var blankLine = new Line(outputBuffer).fill().store();

  //gaugeLine(outputBuffer, "Thruster profile HRR", status.profile.HRR);

  var blankLine = new Line(outputBuffer).fill().store();

  gaugeLine(outputBuffer, "Thruster HFL", status.thrust.HFL);

  gaugeLine(outputBuffer, "Thruster HFR", status.thrust.HFR);

  gaugeLine(outputBuffer, "Thruster HRL", status.thrust.HRL);

  gaugeLine(outputBuffer, "Thruster HRR", status.thrust.HRR);

  gaugeLine(outputBuffer, "Thruster VF", status.thrust.VF);

  gaugeLine(outputBuffer, "Thruster VR", status.thrust.VR);



  var blankLine = new Line(outputBuffer).fill().store();

  var blankLine = new Line(outputBuffer).fill().store();



  booleanLine(outputBuffer, "Direction: ", 11, status.thrust.direction, "Front", "Rear");

  booleanLine(outputBuffer, "fineCoarse: ", 12, status.thrust.fineCoarse, "Coarse", "Fine");

  var blankLine = new Line(outputBuffer).fill().store();


  booleanLine(outputBuffer, "Video Channel 1: : ", 17, status.video.ch1, "CAM 1", "CAM 2");

  booleanLine(outputBuffer, "Video Channel 2: : ", 17, status.video.ch2, "CAM 3", "CAM 4");

  booleanLine(outputBuffer, "Video Channel 3: : ", 17, status.video.ch3, "CAM 5", "CAM 6");


  var blankLine = new Line(outputBuffer).fill().store();


  booleanLine(outputBuffer, "EM1.left: ", 11, status.manipulator.EM1.left, "ON", "OFF");
  booleanLine(outputBuffer, "EM1.right: ", 11, status.manipulator.EM1.right, "ON", "OFF");

  var blankLine = new Line(outputBuffer).fill().store();

  var blankLine = new Line(outputBuffer).fill().store();


  new Line(outputBuffer)
    .column("Voltage", 13)
    .column(Gauge(status.pinger.sourceVoltage, 16, 40, 16, status.pinger.sourceVoltage.toFixed(3)),80)
    .fill()
    .store();


//  var runTime = (new Date()).getTime().toString();// - status.initiationTime).toString();

  var line = new Line(outputBuffer)
    .column("Pinger Error: ", 15)
    .column(status.pinger.error[2].toString(), 80)
    .fill()
    .store();

  var line = new Line(outputBuffer)
    .column("Pinger Error: ", 15)
    .column(status.pinger.error[1].toString(), 80)
    .fill()
    .store();

  var line = new Line(outputBuffer)
    .column("Pinger Error: ", 15)
    .column(status.pinger.error[0].toString(), 80)
    .fill()
    .store();
/*
  var blankLine = new Line(outputBuffer).fill().store();

  var blankLine = new Line(outputBuffer).fill().store();


  var line = new Line(outputBuffer)
    .column("Echoer Error: ", 15)
    .column(status.echoer.error[2].toString(), 80)
    .fill()
    .store();

  var line = new Line(outputBuffer)
    .column("Echoer Error: ", 15)
    .column(status.echoer.error[1].toString(), 80)
    .fill()
    .store();

  var line = new Line(outputBuffer)
    .column("Echoer Error: ", 15)
    .column(status.echoer.error[0].toString(), 80)
    .fill()
    .store();
*/
  var blankLine = new Line(outputBuffer).fill().store();

  var blankLine = new Line(outputBuffer).fill().store();


  var line = new Line(outputBuffer)
    .column("Thruster Error: ", 15)
    .column(status.thrust.error[2].toString(), 80)
    //.column(runTime(),40)
    .fill()
    .store();

  var line = new Line(outputBuffer)
    .column("Thruster Error: ", 15)
    .column(status.thrust.error[1].toString(), 80)
    //.column(runTime(),40)
    .fill()
    .store();

  var line = new Line(outputBuffer)
    .column("Thruster Error: ", 15)
    .column(status.thrust.error[0].toString(), 80)
    //.column(runTime(),40)
    .fill()
    .store();


  var blankLine = new Line(outputBuffer).fill().store();
  var blankLine = new Line(outputBuffer).fill().store();


  var line = new Line(outputBuffer)
    .column("Miscellaneou Error: ", 20)
    .column(status.misc.error[2].toString(), 80)
    .fill()
    .store();

  var line = new Line(outputBuffer)
    .column("Miscellaneou Error: ", 20)
    .column(status.misc.error[1].toString(), 80)
    .fill()
    .store();


  var line = new Line(outputBuffer)
    .column("Miscellaneou Error: ", 20)
    .column(status.misc.error[0].toString(), 80)
    .fill()
    .store();


  var blankLine = new Line(outputBuffer).fill().store();
  var blankLine = new Line(outputBuffer).fill().store();

  var line = new Line(outputBuffer)
    .column("RunTime: ", 64)
    .column(runTime(), 50)
    .fill()
    .store();

  clear();
  outputBuffer.output();
}


//***********
exports.init = function() {
  setInterval(function() {
    draw();
  },50);
}


function runTime() {
  var currentTime = new Date();
  var  _runTimeMillis = currentTime - status.initiationTime;
  var m = new Date(_runTimeMillis);
  var runTimeString =
    ("0" + m.getUTCHours()).slice(-2) + ":" +
    ("0" + m.getUTCMinutes()).slice(-2) + ":" +
    ("0" + m.getUTCSeconds()).slice(-2) + ":" +
    ("00" + m.getTime()).slice(-3);
  return runTimeString.toString();
}
