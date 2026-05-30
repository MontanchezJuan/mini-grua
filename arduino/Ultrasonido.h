#pragma once

class Ultrasonido {
public:
    void  begin();
    float medir();          // retorna cm, 999 si sin eco
    float getDistancia() const { return _distancia; }

private:
    float _distancia = 999;
};