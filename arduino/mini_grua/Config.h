#pragma once

// ── Pines ──────────────────────────────────────────
#define MQ7_PIN     35
#define RELE_PIN     4
#define TRIG_PIN    27
#define ECHO_PIN    33
#define BUZZER_PIN  32
#define LDR_PIN     34
#define SERVO1_PIN  25
#define SERVO2_PIN  26

// ── Umbrales ───────────────────────────────────────
#define UMBRAL_GAS_ENCENDER  150
#define UMBRAL_GAS_APAGAR     50
#define UMBRAL_OSCURIDAD    2500
#define DISTANCIA_PELIGRO      5   // cm

// ── Servo 360 ──────────────────────────────────────
#define STOP_SERVO2  90
#define VEL_SERVO2   25   // offset desde STOP para girar