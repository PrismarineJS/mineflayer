#ifndef _MESH_H_
#define _MESH_H_

#include "Drawable.h"
#include "Texture.h"

#include <vector>
#include <string>
using namespace std;

#include <OpenEXR/ImathVec.h>
using namespace Imath;

class MeshCalculations {
    public:
        enum CalcNormalMethod {
            Surface,
            Average,
            WeightedAverage
        };

        virtual void calculateNormals(CalcNormalMethod mode,
            int creaseAngle) = 0;
        virtual void setShowNormals(bool value) = 0;
};

class Mesh : public Drawable, public MeshCalculations {
    public:
        ~Mesh();

        // draws the mesh as fast as possible (without lists)
        void render();

        // load a wavefront .obj file from disk
        static Mesh * loadFile(const char * file);

        // centered at origin from -0.5 to 0.5
        static Mesh * createUnitCube(Vec3<float> color, Texture * tex);
        static Mesh * createUnitCube(Vec3<float> color);

        // centered at origin with radius 0.5, z from -0.5 to 0.5
        static Mesh * createUnitCylinder(Vec3<float> color, Texture * tex,
            int numSides);
        static Mesh * createUnitCylinder(Vec3<float> color, int numSides);

        // centered at origin from -0.5 to 0.5, z=0
        static Mesh * createUnitPlane(Vec3<float> color, Texture * tex);
        static Mesh * createUnitPlane(Vec3<float> color);

        // recalculate normals
        void calculateNormals(MeshCalculations::CalcNormalMethod mode,
            int creaseAngle);

        // show/hide normal arrows
        void setShowNormals(bool value);

        void superHappyFunTime();

        inline Vec3<float> size() { return m_size; }

        void drawNormalArrows(Vec3<float> m_scale);

    private:
        typedef Vec3<float> Vec3f;
        typedef Vec2<float> Vec2f;

        vector< Vec3<float> > m_vertices;
        vector< Vec3<float> > m_normals;
        vector< Vec2<float> > m_textureCoords;
        vector< Vec3<float> > m_colors;

        vector<int> m_vertexIndices;
        vector<int> m_normalIndices;
        vector<int> m_colorIndices;
        vector<int> m_textureCoordIndices;

        bool m_haveNormals;
        bool m_haveTexCoords;
        bool m_haveColors;

        Vec3<float> m_size;
        Vec3<float> m_beginCorner;
        Vec3<float> m_endCorner;

        Texture * m_texture;

        bool m_showNormals;
        MeshCalculations::CalcNormalMethod m_normalMode;

        Mesh();

        static vector<string> split_string(const string& str,
            const string& split_str);
        static int StrToInt(const string &str);
        static void quad(vector<int> & array, int v1, int v2,
            int v3, int v4);
        static void triangle(vector<int> & array, int v1, int v2,
            int v3);
        void calculatePerSurface(bool normalize);
        void calcCreasedNormals(int creaseAngle);
        float getAngle(Vec3<float> v1, Vec3<float> v2);

};

#endif
