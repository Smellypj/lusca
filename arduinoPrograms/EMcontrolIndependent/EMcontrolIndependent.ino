#include "TinyWireS.h"                  // wrapper class for I2C slave routines
#include <EEPROM.h>

#define TWI_RX_BUFFER_SIZE 16

#define ledPin 1
#define leftEM 1
#define rightEM 3
#define VDpin 4     //voltage divider pin

const byte regSize = 210;       //0xce = 206 so 210 for some redundace
volatile byte i2cRegs[int(regSize)];
volatile byte regPosition =0;

bool execute = false;



void Blink(byte times){ 
  for (byte i=0; i< times; i++){
    digitalWrite(ledPin,HIGH);
    tws_delay(175);
    digitalWrite(ledPin,LOW);
    tws_delay(175);
  }
}

byte rp =0;
void executeCommand() {
  byte rp = regPosition;
  
  if(rp == 0x21) {
    analogWrite(leftEM, i2cRegs[rp]);
  } else if(rp == 0x22) {
    analogWrite(rightEM, i2cRegs[rp]);
  } else if(rp == 0x10) {
    Blink(i2cRegs[rp]);
  } else if(rp == 0x99) {
    //long raw = analogRead(VDpin);
    //Blink(1);
    long raw = 985;
    i2cRegs[rp] = (raw >> 8) & 0xFF;   //high byte
    i2cRegs[rp+1] = raw & 0xFF;        //low byte     hahaha low B
  } else if(rp == 0xCE) {
    EEPROM.put(0, i2cRegs[rp]);                //change address value
    Blink(1000);    
    delay(1000);
  }
  /*
  switch(regPosition) {
    case 0x21 : {
      analogWrite(leftEM, i2cRegs[regPosition]);
      break;
    }
    case 0x22 : {
      analogWrite(rightEM, i2cRegs[regPosition]);
      break;
    }
    case 0x10 : {
      Blink(i2cRegs[regPosition]);
    }
    case 0x99: {             //0x99
      //byte raw = analogRead(VDpin);
      byte raw = 985;
      i2cRegs[regPosition] = (raw >> 8) & 0xFF;   //high byte
      i2cRegs[regPosition++] = raw & 0xFF;        //low byte     hahaha low B
      Blink(1);
      break;
    }
    case 0xCE : {
      EEPROM.put(0, i2cRegs[regPosition]);                //change address value
      Blink(1000);    
      delay(1000);
    }
    default: {
      //Blink(1);
      break;
    }
  }
  */
}


void requestEvent() {
  TinyWireS.send(i2cRegs[regPosition]);
  //TinyWireS.send(regPosition);
  regPosition++;
  if(regPosition >= regSize) {
    regPosition =0;
  }
}



void receiveEvent(byte numBytes) {
  if(numBytes < 1) {
    //no bytes, sanity check
    return;
  }
  if(numBytes > TWI_RX_BUFFER_SIZE) {
    //more bytes than expected
    return;
  }

  execute = true;

  regPosition = TinyWireS.receive();
  numBytes--;

  if(!numBytes) {
    //no bytes left
    return;
  }

  while(numBytes--) {
    i2cRegs[regPosition] = TinyWireS.receive();
    
    regPosition++;
    if(regPosition >= regSize) {
      regPosition =0;
    }
  }
}



void setup() {
  volatile byte I2C_SLAVE_ADDR = 0;
  I2C_SLAVE_ADDR = EEPROM.read(0);         //get its own slave address from EEPROM
  if(I2C_SLAVE_ADDR > 127 || I2C_SLAVE_ADDR < 1) {
    I2C_SLAVE_ADDR = 100;
  }
  TinyWireS.begin(I2C_SLAVE_ADDR);      // init I2C Slave mode
  
  TinyWireS.onReceive(receiveEvent);
  TinyWireS.onRequest(requestEvent);

  pinMode(leftEM,OUTPUT);
  pinMode(rightEM,OUTPUT);

}


void loop() {
  if(execute) {       //ok
    executeCommand();
    execute = false;
  }
  TinyWireS_stop_check();
}
