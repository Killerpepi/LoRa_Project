#include <SPI.h>
#include <LoRa.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <U8g2lib.h>

// Initialize U8g2 for SSD1306 OLED (I2C)
U8G2_SSD1306_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, /* reset=*/ U8X8_PIN_NONE);

#define csPIN 4
#define resetPIN 2
#define irqPIN 3

byte localAddress = 0xCC;
byte receiverAddresses[] = { 0xC1, 0xC2, 0xC3 };
int receiverIndex = 0;
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 10000;

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);
const char* mqttServer = "192.168.0.101";
int mqttPort = 1883;
String mqttTopic = "pmbm";
const char* ssid = "E109-E110";
const char* password = "DBHaacht24";

void setup() {
  Serial.begin(9600);
  while (!Serial);

  Wire.begin();  // Corrected: Arduino R4 Uno uses fixed I2C pins (SDA = A4, SCL = A5)

  // Initialize OLED
  u8g2.begin();
  u8g2.clearBuffer();
  u8g2.setFont(u8g2_font_ncenB08_tr);
  u8g2.drawStr(10, 20, "Hello, U8g2!");
  u8g2.sendBuffer();
  delay(2000); // Show "Hello, U8g2!" for 2 seconds

  // LoRa setup
  LoRa.setPins(csPIN, resetPIN, irqPIN);
  int retryCount = 0;
  while (!LoRa.begin(866E6) && retryCount < 5) {
    Serial.println("LoRa initialization failed! Retrying...");
    delay(1000);
    retryCount++;
  }

  if (retryCount >= 5) {
    Serial.println("LoRa failed to initialize. System halted.");
    while (true);
  }

  LoRa.enableCrc();
  LoRa.setSpreadingFactor(7);
  LoRa.setSignalBandwidth(125E3);
  LoRa.setTxPower(20);

  Serial.println("LoRa Sender & Receiver Initialized");

  // WiFi setup
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(100);
  }
  Serial.println("Connected to WiFi!");
}

void loop() {
  // Periodic message send logic
  unsigned long currentMillis = millis();
  if (currentMillis - lastSendTime >= sendInterval) {
    lastSendTime = currentMillis;
    SendMsg();
  }

  // LoRa message reception and display
  int packetSize = LoRa.parsePacket();
  if (packetSize > 0) {
    Serial.println("Bericht gedetecteerd!");
    if (packetSize < 4) {
      Serial.println("Ongeldig bericht ontvangen (te klein). Genegeerd.");
      while (LoRa.available()) LoRa.read();
      return;
    }

    byte sender = LoRa.read();
    byte recipient = LoRa.read();
    byte incomingMsgId = LoRa.read();
    byte incomingLength = LoRa.read();
    if (recipient != localAddress) {
      Serial.println("Bericht is niet voor deze ontvanger. Genegeerd.");
      while (LoRa.available()) LoRa.read();
      return;
    }

    String incomingMessage = "";
    while (LoRa.available()) {
      incomingMessage += (char)LoRa.read();
    }

    Serial.println("========== ONTVANGEN BERICHT ==========");
    Serial.print("Bericht: ");
    Serial.println(incomingMessage);
    Serial.print("RSSI: ");
    Serial.println(LoRa.packetRssi());
    Serial.print("SNR: ");
    Serial.println(LoRa.packetSnr());
    Serial.println("=======================================");

    // Display the received message on the OLED
    u8g2.clearBuffer();
    u8g2.setFont(u8g2_font_ncenB08_tr);
    u8g2.drawStr(0, 10, "Ontvangen:");
    u8g2.drawStr(0, 30, incomingMessage.c_str());
    u8g2.sendBuffer();

    mqttClient.loop();
    String mqttMessage = "Van: 0x" + String(sender, HEX) + " | Bericht: " + incomingMessage;
    if (!mqttClient.publish(mqttTopic.c_str(), mqttMessage.c_str())) {
      Serial.println("Fout bij verzenden naar MQTT broker!");
    }
  }
}

void SendMsg() {
  byte targetAddress = receiverAddresses[receiverIndex];
  int msgCount = receiverIndex + 1;
  String msg = "Call in " + String(msgCount);

  LoRa.beginPacket();
  LoRa.write(targetAddress);
  LoRa.write(localAddress);
  LoRa.write(msgCount);
  LoRa.write(msg.length());
  LoRa.print(msg);
  LoRa.endPacket();

  receiverIndex = (receiverIndex + 1) % 3;
}
