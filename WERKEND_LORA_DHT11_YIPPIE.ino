#include <SPI.h>
#include <LoRa.h>
#include <DHT11.h>

#define csPIN     4
#define resetPIN  2
#define irqPIN    3

#define MSG_LEN 150

byte localAddress = 0xC3; // Local address of this device
DHT11 dht11(9); // DHT11 sensor connected to pin 9 (no need for begin() in this case)

void setup() {
  Serial.begin(9600);
  delay(1000);
  while (!Serial);
  
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

      // Check if the message is "Call in 3" and if it is from address 0xCC
      if (String(incomingMsg) == "Call in 3") {
        int temperature = 0;
        int humidity = 0;

        // Read temperature and humidity from the DHT11 sensor
        int result = dht11.readTemperatureHumidity(temperature, humidity);

        // Check if the reading is successful
        if (result == 0) {
          Serial.print("Sending Temperature: ");
          Serial.print(temperature);
          Serial.print(" °C\tHumidity: ");
          Serial.print(humidity);
          Serial.println(" %");

          // Send the data back over LoRa
          LoRa.beginPacket();
          LoRa.write(localAddress);  // Local address of this device
          LoRa.write(sender);        // Sender address
          LoRa.write(messageID);     // Message ID
          LoRa.write(0);             // Message Length (we can use 0 for simplicity)
          
          String sensorData = "Temp: " + String(temperature) + "C, Hum: " + String(humidity) + "%";
          LoRa.print(sensorData);    // Send sensor data as message
          
          LoRa.endPacket();
        } else {
          // Print error if reading failed
          Serial.println(DHT11::getErrorString(result));
        }
      }
    }
  }
}
