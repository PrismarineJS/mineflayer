#ifndef VECTOR3D_H
#define VECTOR3D_H

#include "Util.h"

template <class T>
class Vector3D {
public:
    T x;
    T y;
    T z;

    Vector3D<T>(): x(),y(),z() {}
    Vector3D<T>(const Vector3D<T> & other) : x(other.x), y(other.y), z(other.z) {}
    Vector3D<T>(T x, T y, T z) : x(x), y(y), z(z) {}
    void setValue(T _x, T _y, T _z) { x=_x; y=_y; z=_z; }
    Vector3D<T> & operator+=(const Vector3D<T> & other) {
        x += other.x;
        y += other.y;
        z += other.z;
        return *this;
    }
    const Vector3D<T> operator+(const Vector3D<T> & other) const {
        return Vector3D<T>(*this) += other;
    }
    Vector3D<T> & operator-=(const Vector3D<T> & other) {
        x -= other.x;
        y -= other.y;
        z -= other.z;
        return *this;
    }
    const Vector3D<T> operator-(const Vector3D<T> & other) const {
        return Vector3D<T>(*this) -= other;
    }
    Vector3D<T> & operator/=(T divisor) {
        x /= divisor;
        y /= divisor;
        z /= divisor;
        return *this;
    }
    const Vector3D<T> operator/(T divisor) const {
        return Vector3D<T>(*this) /= divisor;
    }
    Vector3D<T> & operator*=(T n) {
        x *= n;
        y *= n;
        z *= n;
        return *this;
    }
    const Vector3D<T> operator*(T n) const {
        return Vector3D<T>(*this) *= n;
    }
    Vector3D<T> & operator*=(const Vector3D<T> & other) {
        x *= other.x;
        y *= other.y;
        z *= other.z;
        return *this;
    }
    const Vector3D<T> operator*(const Vector3D<T> &other) const {
        return Vector3D<T>(*this) *= other;
    }
    Vector3D<T> & operator%=(const Vector3D<T> & other) {
        x = Util::euclideanMod(x, other.x);
        y = Util::euclideanMod(y, other.y);
        z = Util::euclideanMod(z, other.z);
        return *this;
    }
    const Vector3D<T> operator%(const Vector3D<T> & other) const {
        return Vector3D<T>(*this) %= other;
    }
    bool operator==(const Vector3D<T> & other) const {
        return other.x == x && other.y == y && other.z == z;
    }
    bool operator!=(const Vector3D<T> & other) const {
        return !(*this == other);
    }
    T distanceSquared() const {
        return x * x + y * y + z * z;
    }
    template <class O>
    double distanceTo(const Vector3D<O> & other) const {
        return std::sqrt(std::pow(other.x-x, 2) + std::pow(other.y-y, 2) + std::pow(other.z-z, 2));
    }
};

typedef Vector3D<int> Int3D;
typedef Vector3D<double> Double3D;

#endif // VECTOR3D_H
