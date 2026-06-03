#pragma once

class Buzzer {
public:
    void begin();
    void actualizar(float distancia);   // activa si dist < DISTANCIA_PELIGRO
};