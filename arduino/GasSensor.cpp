#include "GasSensor.h"
#include "Config.h"
#include "Arduino.h"

void GasSensor::begin() {
    pinMode(MQ7_PIN, INPUT);
}

int GasSensor::leer() {
    long suma = 0;
    for (int i = 0; i < 15; i++) {
        suma += analogRead(MQ7_PIN);
        delayMicroseconds(80);
    }
    _valor = suma / 15;
    return _valor;
}