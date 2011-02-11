#ifndef INT3D_H
#define INT3D_H

#include "Util.h"

class Int3D {
public:
    int x;
    int y;
    int z;

    Int3D() {}
    Int3D(const Int3D & other) : x(other.x), y(other.y), z(other.z) {}
    Int3D(int x, int y, int z) : x(x), y(y), z(z) {}
    void setValue(int _x, int _y, int _z) { x=_x; y=_y; z=_z; }
    Int3D & operator+=(const Int3D & other) {
        x += other.x;
        y += other.y;
        z += other.z;
        return *this;
    }
    const Int3D operator+(const Int3D & other) const {
        return Int3D(*this) += other;
    }
    Int3D & operator-=(const Int3D & other) {
        x -= other.x;
        y -= other.y;
        z -= other.z;
        return *this;
    }
    const Int3D operator-(const Int3D & other) const {
        return Int3D(*this) -= other;
    }
    Int3D & operator-=(int offset) {
    x -= offset;
    y -= offset;
    z -= offset;
    return *this;
    }
    const Int3D operator-(int offset) const {
        return Int3D(*this) -= offset;
    }
    Int3D & operator/=(int divisor) {
        x /= divisor;
        y /= divisor;
        z /= divisor;
        return *this;
    }
    const Int3D operator/(int divisor) const {
        return Int3D(*this) /= divisor;
    }
    Int3D & operator*=(int n) {
        x *= n;
        y *= n;
        z *= n;
        return *this;
    }
    const Int3D operator*(int n) const {
        return Int3D(*this) *= n;
    }
    Int3D & operator*=(const Int3D & other) {
        x *= other.x;
        y *= other.y;
        z *= other.z;
        return *this;
    }
    const Int3D operator*(const Int3D &other) const {
        return Int3D(*this) *= other;
    }
    Int3D & operator%=(const Int3D & other) {
        x = Util::euclideanMod(x, other.x);
        y = Util::euclideanMod(y, other.y);
        z = Util::euclideanMod(z, other.z);
        return *this;
    }
    const Int3D operator%(const Int3D & other) const {
        return Int3D(*this) %= other;
    }
    bool operator==(const Int3D & other) const {
        return other.x == x && other.y == y && other.z == z;
    }
    bool operator!=(const Int3D & other) const {
        return !(*this == other);
    }
};

#endif // INT3D_H
