#include <SPI.h>
#include <LoRa.h>

#define csPIN     4   // LoRa Chip Select (NSS)
#define resetPIN  2   // LoRa Reset
#define irqPIN    3   // LoRa DIO0 (Interrupt)

#define rainSensorPin A0  // Analog pin for rain sensor (A0 on Uno R4 WiFi)

#define MSG_LEN 150

byte localAddress = 0xC1; // Local address of this device

void setup() {
  Serial.begin(9600);
  delay(1000);
  
  LoRa.setPins(csPIN, resetPIN, irqPIN);

  if (!LoRa.begin(866E6)) {
    Serial.println("Starting LoRa failed!");
    while (1);
  }
  
  Serial.println("LoRa Receiver Ready");
}

void loop() {
  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    char incomingMsg[MSG_LEN + 1] = "";
    int i = 0;

    int recipient = LoRa.read();
    byte sender = LoRa.read();
    byte messageID = LoRa.read();
    byte incomingLen = LoRa.read();

    while (LoRa.available() && i < MSG_LEN) {
      incomingMsg[i] = (char)LoRa.read();
      i++;
    }
    incomingMsg[i] = '\0';

    // Only process if the sender is 0xCC
    if (sender == 0xCC) {
      Serial.println("==============================");
      Serial.print("Received from: 0x");
      Serial.println(sender, HEX);
      Serial.print("Message ID: ");
      Serial.println(messageID);
      Serial.print("Message Length: ");
      Serial.println(incomingLen);
      Serial.print("Message: ");
      Serial.println(incomingMsg);
      Serial.print("RSSI: ");
      Serial.println(LoRa.packetRssi());
      Serial.print("SNR: ");
      Serial.println(LoRa.packetSnr());
      Serial.println("==============================");

      // Check if the message is "Call in 1"
      if (String(incomingMsg) == "Call in 1") {
        int rainValue = analogRead(rainSensorPin); // Read raw sensor value
        int rainIntensity = map(rainValue, 1023, 0, 0, 100); // Convert to percentage (0% = dry, 100% = heavy rain)

        // Keep values within 0-100%
        rainIntensity = constrain(rainIntensity, 0, 100);

        Serial.print("Sending Rain Intensity: ");
        Serial.print(rainIntensity);
        Serial.println("%");

        // Send the rain intensity data back over LoRa
        LoRa.beginPacket();
        LoRa.write(localAddress);  // Local address of this device
        LoRa.write(sender);        // Sender address
        LoRa.write(messageID);     // Message ID
        LoRa.write(0);             // Message Length
        
        String sensorData = "Rain Intensity: " + String(rainIntensity) + "%";
        LoRa.print(sensorData);    // Send rain intensity percentage as message
        
        LoRa.endPacket();
      }
    }
  }
}
