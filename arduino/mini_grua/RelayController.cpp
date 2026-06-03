#include "RelayController.h"
#include "Config.h"
#include "Arduino.h"

void RelayController::begin() {
    apagar();   // estado inicial seguro
}

void RelayController::encender() {
    pinMode(RELE_PIN, OUTPUT);
    digitalWrite(RELE_PIN, LOW);
    _encendido = true;
}

void RelayController::apagar() {
    pinMode(RELE_PIN, INPUT);
    _encendido = false;
}