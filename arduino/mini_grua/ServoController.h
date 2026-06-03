#pragma once
#include <ESP32Servo.h>

class ServoController {
public:
    void begin();

    // Servo 1 (vertical, posición absoluta)
    void updateVertical(int ryAxis);
    void setPos1(int pos);
    int  getPos1() const { return _pos1; }

    // Servo 2 (base 360)
    void girarDerecha();
    void girarIzquierda();
    void frenar();

    int getDireccionActual() const { return _direccionActual; }

private:
    Servo _servo1;
    Servo _servo2;

    int _pos1            = 90;
    int _ultimaPos1      = 90;
    int _direccionActual = 0;   // 0=stop  1=derecha  2=izquierda
};