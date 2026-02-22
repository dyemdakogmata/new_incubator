// ESP32 Configuration
// This file exports the ESP32 API URL for use throughout the app

// The ESP32 IP address - update this to match your device's IP
// You can find this in the Arduino IDE serial monitor when the ESP32 boots
export const ESP32_API_URL = process.env.NEXT_PUBLIC_ESP32_API_URL || "http://192.168.1.50";

// Extract just the IP for display purposes
export const ESP32_IP = ESP32_API_URL.replace(/^https?:\/\//, "");

// Debug flag - set to true to see connection logs in browser console
export const DEBUG_CONNECTIONS = process.env.NODE_ENV === "development";
