#include "Buzzer.h"
#include "Config.h"
#include "Arduino.h"

void Buzzer::begin() {
    pinMode(BUZZER_PIN, OUTPUT);
    digitalWrite(BUZZER_PIN, LOW);
}

void Buzzer::actualizar(float distancia) {
    digitalWrite(BUZZER_PIN, distancia < DISTANCIA_PELIGRO ? HIGH : LOW);
}