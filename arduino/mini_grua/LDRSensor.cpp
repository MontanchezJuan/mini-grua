#include "LDRSensor.h"
#include "Config.h"
#include "Arduino.h"

void LDRSensor::begin() {
    pinMode(LDR_PIN, INPUT);
}

int LDRSensor::leer() {
    _valor   = analogRead(LDR_PIN);
    _pocaLuz = (_valor > UMBRAL_OSCURIDAD);
    return _valor;
}