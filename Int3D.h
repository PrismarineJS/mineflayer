#ifndef INT3D_H
#define INT3D_H

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
    Int3D & operator/=(int divisor) {
        x /= divisor;
        y /= divisor;
        z /= divisor;
        return *this;
    }
    const Int3D operator/(int divisor) const {
        return Int3D(*this) /= divisor;
    }
};

#endif // INT3D_H
