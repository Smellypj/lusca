console.log('starting')
var i2c = require('i2c');
var io = require('socket.io-client');
var socket = io.connect('https://localhost:80');

exports.init = function(pHTempAddr) {
  device = i2c(pHTempAddr, {device: '/dev/i2c-1'});
}

console.log('initiate i2c');

var pHResult = [];
var tempResult = [];
var pHByte;
var tempByte;
socket.on('pHTemp', function(command) {
  console.log('receive smth from channel pHTemp');
  pHTemp();
  console.log('calling function pHTemp');

  //send results
  if (command == 0x67) {
    socket.emit('pH Value', pHByte)
  } else if (command == 0x68) {
    socket.emit('Temp Value', tempByte)
  } else if (command == 0x69) {
    socket.emit('pH Value', pHByte)
    socket.emit('Temp Value', tempByte)
  };
});


function unBitShift(result0, result1) {
  return (result1 << 8) | result2;
};


function pHTemp() {
  console.log('running function pHTemp');
  device.readBytes(0x69, 4, function(err, res) {
    if (err){
      var errorMessage = "error reading" + err;
      socket.emit('pH & Temp error', errorMessage);
      return;
    };
    pHResult[0] = res[0];
    pHResult[1] = res[1];
    pHByte = unBitShift(pHResult[0], pHResult[1]);

    tempResult[0] = res[0];
    tempResult[1] = res[1];

    tempByte = unBitShift(tempResult[0], tempResult[1]);
  });
/*

  if (command == 0x67) {
    //writing command still required??
    device.readBytes(0x67, 2, function(err, res) {
      if (err){
        var errorMessage = "error reading" + err;
        socket.emit('pH error', errorMessage);
        return;
      }
        pHResult[0] = res[0];
        pHResult[1] = res[1];

        pHByte = unBitShift(pHResult[0], pHResult[1])
      })
  } else if (command == 0x68) {
    device.readBytes(0x68, 2, function(err, res) {
      if (err){
        var errorMessage = "error reading" + err;
        socket.emit('Temp error', errorMessage);
        return;
      }
      tempResult[0] = res[0];
      tempResult[1] = res[1];

      tempByte = unBitShift(tempResult[0], tempResult[1]);
    })
  } else if (command == 0x69) {
    device.readBytes(0x69, 4, function(err, res) {
      if (err){
        var errorMessage = "error reading" + err;
        socket.emit('pH & Temp error', errorMessage);
        return;
      }
      pHResult[0] = res[0];
      pHResult[1] = res[1];
      pHByte = unBitShift(pHResult[0], pHResult[1])

      tempResult[0] = res[0];
      tempResult[1] = res[1];

      tempByte = unBitShift(tempResult[0], tempResult[1]);
    })
    }
  }
  */
};
