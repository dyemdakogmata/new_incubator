/**
 * EggWatch Pro — ESP32 Firmware
 * 
 * Hardware:
 *   - ESP32 (any variant)
 *   - AHT30 temperature/humidity sensor (I2C, SDA=21, SCL=22)
 *   - DS3231 RTC module (same I2C bus)
 * 
 * Libraries required (install via Arduino Library Manager):
 *   - RTClib by Adafruit
 *   - ArduinoJson by Benoit Blanchon
 *   - WiFi (built-in ESP32 core)
 *   - WebServer (built-in ESP32 core)
 * 
 * Dashboard connection:
 *   Set NEXT_PUBLIC_ESP32_API_URL=http://<this device's IP> in .env.local
 */

#include <Wire.h>
#include <RTClib.h>
#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>

// ============================================================
// CONFIGURATION — edit these
// ============================================================
const char* WIFI_SSID     = "SKYW_4710_2G";
const char* WIFI_PASSWORD = "7VeRUe4v";

// AHT30 I2C address
#define AHT30_ADDR 0x38

// I2C pins
#define SDA_PIN 21
#define SCL_PIN 22

// Log storage — keeps last N readings in RAM
#define MAX_LOG_ENTRIES 50

// Motor control pin (optional — add your hardware)
// #define MOTOR_PIN 23
// ============================================================

RTC_DS3231 rtc;
WebServer server(80);

// ---- Sensor data (updated every loop) ----
float currentTemp     = 0.0;
float currentHumidity = 0.0;
bool  sensorOk        = false;

// ---- Egg turning tracking ----
int   turnsToday      = 0;
int   nextTurnIn      = 3600;   // seconds until next turn
int   turnsPerDay     = 3;
int   intervalHours   = 8;
bool  motorRunning    = false;

// ---- Log ring buffer ----
struct LogEntry {
  char   id[20];
  char   timestamp[25];  // ISO 8601
  float  temperature;
  float  humidity;
  bool   eggTurningEvent;
  char   motorStatus[10];  // "running" or "idle"
};

LogEntry logBuffer[MAX_LOG_ENTRIES];
int logHead  = 0;   // index of next write
int logCount = 0;   // how many entries are valid

// ---- Timing ----
unsigned long lastSensorRead  = 0;
unsigned long lastLogWrite    = 0;
unsigned long lastCountdown   = 0;
unsigned long lastDayReset    = 0;
unsigned long logEntryCounter = 0;

// ============================================================
// CORS helper — required so the browser can reach the ESP32
// ============================================================
void addCORSHeaders() {
  server.sendHeader("Access-Control-Allow-Origin",  "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
}

// ============================================================
// AHT30 — read temperature and humidity
// ============================================================
bool readAHT30(float &temp, float &hum) {
  // Trigger measurement
  Wire.beginTransmission(AHT30_ADDR);
  Wire.write(0xAC);
  Wire.write(0x33);
  Wire.write(0x00);
  if (Wire.endTransmission() != 0) return false;
  delay(80);

  Wire.requestFrom(AHT30_ADDR, 6);
  if (Wire.available() < 6) return false;

  uint8_t data[6];
  for (int i = 0; i < 6; i++) data[i] = Wire.read();

  // Check busy bit
  if (data[0] & 0x80) return false;

  uint32_t hum_raw  = ((uint32_t)data[1] << 12) |
                      ((uint32_t)data[2] << 4)  |
                      ((data[3] & 0xF0) >> 4);

  uint32_t temp_raw = ((uint32_t)(data[3] & 0x0F) << 16) |
                      ((uint32_t)data[4] << 8) |
                      (uint32_t)data[5];

  hum  = (hum_raw  * 100.0f) / 1048576.0f;
  temp = (temp_raw * 200.0f  / 1048576.0f) - 50.0f;
  return true;
}

// ============================================================
// Build ISO 8601 timestamp from RTC
// ============================================================
void buildTimestamp(char* buf, size_t len) {
  DateTime now = rtc.now();
  snprintf(buf, len, "%04d-%02d-%02dT%02d:%02d:%02dZ",
    now.year(), now.month(), now.day(),
    now.hour(), now.minute(), now.second());
}

// ============================================================
// Append a reading to the log ring buffer
// ============================================================
void appendLog(bool eggTurn) {
  LogEntry& e = logBuffer[logHead];
  snprintf(e.id, sizeof(e.id), "%lu", ++logEntryCounter);
  buildTimestamp(e.timestamp, sizeof(e.timestamp));
  e.temperature = currentTemp;
  e.humidity    = currentHumidity;
  e.eggTurningEvent = eggTurn;
  snprintf(e.motorStatus, sizeof(e.motorStatus), 
           motorRunning ? "running" : "idle");

  logHead = (logHead + 1) % MAX_LOG_ENTRIES;
  if (logCount < MAX_LOG_ENTRIES) logCount++;
}

// ============================================================
// HTTP: GET /api/status
// Dashboard polls this every 5 seconds
// ============================================================
void handleStatus() {
  addCORSHeaders();

  StaticJsonDocument<512> doc;
  doc["temperature"] = round(currentTemp * 10.0f) / 10.0f;
  doc["humidity"]    = round(currentHumidity * 10.0f) / 10.0f;
  doc["motorStatus"] = motorRunning ? "running" : "idle";
  doc["turnsCompletedToday"] = turnsToday;
  doc["nextTurnIn"] = nextTurnIn;
  
  // Add timestamp
  char ts[25];
  buildTimestamp(ts, sizeof(ts));
  doc["lastUpdated"] = ts;

  String output;
  serializeJson(doc, output);
  server.send(200, "application/json", output);
}

// ============================================================
// HTTP: GET /api/logs?limit=20
// Dashboard fetches this every 15 minutes
// ============================================================
void handleLogs() {
  addCORSHeaders();

  int limit = 20;
  if (server.hasArg("limit")) {
    limit = server.arg("limit").toInt();
    if (limit < 1)  limit = 1;
    if (limit > MAX_LOG_ENTRIES) limit = MAX_LOG_ENTRIES;
  }

  int available = min(logCount, limit);

  // Build JSON array — most recent first
  String output = "[";
  for (int i = 0; i < available; i++) {
    // Walk backwards from the last written entry
    int idx = ((logHead - 1 - i) + MAX_LOG_ENTRIES) % MAX_LOG_ENTRIES;
    const LogEntry& e = logBuffer[idx];

    StaticJsonDocument<256> entry;
    entry["id"] = e.id;
    entry["timestamp"] = e.timestamp;
    entry["temperature"] = round(e.temperature * 10.0f) / 10.0f;
    entry["humidity"] = round(e.humidity * 10.0f) / 10.0f;
    entry["eggTurningEvent"] = e.eggTurningEvent;
    entry["motorStatus"] = e.motorStatus;

    String entryStr;
    serializeJson(entry, entryStr);
    output += entryStr;
    if (i < available - 1) output += ",";
  }
  output += "]";

  server.send(200, "application/json", output);
}

// ============================================================
// HTTP: POST /api/schedule
// Dashboard sends turning schedule updates here
// ============================================================
void handleSchedule() {
  addCORSHeaders();

  if (server.hasArg("plain")) {
    StaticJsonDocument<128> doc;
    DeserializationError err = deserializeJson(doc, server.arg("plain"));
    if (!err) {
      turnsPerDay   = doc["turnsPerDay"] | doc["turns_per_day"] | turnsPerDay;
      intervalHours = doc["intervalHours"] | doc["interval_hours"] | intervalHours;
      nextTurnIn    = intervalHours * 3600;
      Serial.printf("[Schedule] Updated: %d turns/day, every %d hours\n",
                    turnsPerDay, intervalHours);
    }
  }

  // Return the updated schedule
  StaticJsonDocument<128> response;
  response["turnsPerDay"] = turnsPerDay;
  response["intervalHours"] = intervalHours;
  
  String output;
  serializeJson(response, output);
  server.send(200, "application/json", output);
}

// ============================================================
// HTTP: OPTIONS preflight (required for CORS)
// ============================================================
void handleOptions() {
  addCORSHeaders();
  server.send(204);
}

// ============================================================
// SETUP
// ============================================================
void setup() {
  Serial.begin(115200);
  Wire.begin(SDA_PIN, SCL_PIN);
  delay(100);

  // ---- RTC ----
  if (!rtc.begin()) {
    Serial.println("[RTC] ERROR: DS3231 not found!");
    // Continue anyway — timestamps will be wrong but sensor data still works
  } else {
    Serial.println("[RTC] DS3231 OK");
    // Uncomment the line below ONCE to set the RTC to compile time, then re-comment it:
    // rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
  }

  // ---- AHT30 soft reset ----
  Wire.beginTransmission(AHT30_ADDR);
  Wire.write(0xBA);
  Wire.endTransmission();
  delay(100);
  Serial.println("[AHT30] Initialized");

  // ---- WiFi ----
  Serial.printf("[WiFi] Connecting to %s\n", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("[WiFi] Connected! IP address: ");
  Serial.println(WiFi.localIP());
  Serial.println();
  Serial.println("==============================================");
  Serial.print("  Dashboard URL: http://");
  Serial.println(WiFi.localIP());
  Serial.println("  Set NEXT_PUBLIC_ESP32_API_URL=http://" + WiFi.localIP().toString());
  Serial.println("  in your .env.local file, then toggle Live ESP32 mode.");
  Serial.println("==============================================");

  // ---- HTTP routes ----
  server.on("/api/status",   HTTP_GET,     handleStatus);
  server.on("/api/logs",     HTTP_GET,     handleLogs);
  server.on("/api/schedule", HTTP_POST,    handleSchedule);
  // OPTIONS preflight for each route
  server.on("/api/status",   HTTP_OPTIONS, handleOptions);
  server.on("/api/logs",     HTTP_OPTIONS, handleOptions);
  server.on("/api/schedule", HTTP_OPTIONS, handleOptions);
  server.begin();
  Serial.println("[HTTP] Server started on port 80");

  // ---- Initial sensor read ----
  readAHT30(currentTemp, currentHumidity);
  appendLog(false);
}

// ============================================================
// LOOP
// ============================================================
void loop() {
  server.handleClient();

  unsigned long now = millis();

  // ---- Read sensor every 2 seconds ----
  if (now - lastSensorRead >= 2000) {
    lastSensorRead = now;
    sensorOk = readAHT30(currentTemp, currentHumidity);

    if (sensorOk) {
      Serial.printf("[Sensor] Temp: %.1f°C  Humidity: %.1f%%\n",
                    currentTemp, currentHumidity);
    } else {
      Serial.println("[Sensor] AHT30 read failed");
    }
  }

  // ---- Append to log every 60 seconds ----
  if (now - lastLogWrite >= 60000) {
    lastLogWrite = now;
    appendLog(false);
  }

  // ---- Countdown timer (every 1 second) ----
  if (now - lastCountdown >= 1000) {
    lastCountdown = now;
    if (nextTurnIn > 0) {
      nextTurnIn--;
    } else {
      // Time to turn eggs!
      turnsToday++;
      nextTurnIn = intervalHours * 3600;
      motorRunning = true;
      appendLog(true);  // log the turning event
      Serial.printf("[Motor] Egg turn #%d triggered!\n", turnsToday);

      // TODO: Add your motor control code here
      // e.g. digitalWrite(MOTOR_PIN, HIGH);
      // delay(5000);
      // digitalWrite(MOTOR_PIN, LOW);
      motorRunning = false;
    }
  }

  // ---- Reset turns counter at midnight ----
  if (now - lastDayReset >= 86400000UL) {
    lastDayReset = now;
    turnsToday = 0;
    Serial.println("[Timer] Daily turn counter reset");
  }
}
