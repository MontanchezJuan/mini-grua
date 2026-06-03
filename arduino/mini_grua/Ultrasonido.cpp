#include "Ultrasonido.h"
#include "Config.h"
#include "Arduino.h"

void Ultrasonido::begin() {
    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);
}

float Ultrasonido::medir() {
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);

    long dur = pulseIn(ECHO_PIN, HIGH, 20000);
    _distancia = (dur == 0) ? 999 : dur * 0.034f / 2.0f;
    return _distancia;
}