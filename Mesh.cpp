#include <iostream>
#include <fstream>
#include <cstring>
#include <ctime>
using namespace std;

#include "Mesh.h"

#include <QtOpenGL>

Mesh::Mesh() :
    m_haveNormals(false),
    m_haveTexCoords(false),
    m_haveColors(false),
    m_size(Vec3<float>(0, 0, 0)),
    m_beginCorner(Vec3<float>(0, 0, 0)),
    m_endCorner(Vec3<float>(0, 0, 0)),
    m_texture(NULL),
    m_showNormals(false)
{

}

Mesh * Mesh::loadFile(const char * file) {
    ifstream infile(file);

    if(infile.fail()) {
        cerr << "Error opening file " << file << endl;
        return NULL;
    }

    Mesh * mesh = new Mesh;

    char current_line[1024];

    while (!infile.eof()) {
        infile.getline(current_line, 1024);

        switch (current_line[0]) {
            case 'v':
                float x, y, z;
                switch(current_line[1])
                {
                case 'n':
                    sscanf(current_line, "vn %f %f %f", &x,&y,&z);
                    mesh->m_normals.push_back(Vec3f(x, y, z));
                    break;

                case 't':
                    sscanf(current_line, "vt %f %f", &x,&y);
                    mesh->m_textureCoords.push_back(Vec2f(x, y));
                    break;

                default:
                    sscanf(current_line, "v %f %f %f", &x,&y,&z);
                    if( x < mesh->m_beginCorner.x ) mesh->m_beginCorner.x = x;
                    if( y < mesh->m_beginCorner.y ) mesh->m_beginCorner.y = y;
                    if( z < mesh->m_beginCorner.z ) mesh->m_beginCorner.z = z;
                    if( x > mesh->m_endCorner.x ) mesh->m_endCorner.x = x;
                    if( y > mesh->m_endCorner.y ) mesh->m_endCorner.y = y;
                    if( z > mesh->m_endCorner.z ) mesh->m_endCorner.z = z;

                    mesh->m_vertices.push_back(Vec3f(x, y, z));
                    break;
                }
                break;
            case 'f':
                vector<string> faces = split_string(current_line, " \t.\r\n");

                int vnt[3][3] = {{-1, -1, -1},{-1, -1, -1},{-1, -1, -1}};
                string::size_type begin, end;

                for(int i = 0;i < 2;i++)
                {
                    begin = 0;
                    int j = 0;
                    do
                    {
                        end = faces[i+1].find_first_of("/", begin);

                        if(begin < end)
                        {
                            vnt[i][j] = StrToInt(faces[i+1].substr(begin, end-begin))-1;
                        }
                        else
                            vnt[i][j] = -1;
                        begin = end+1;
                        j++;
                    }while(end != string::npos);
                }

                for(unsigned int i = 3;i < faces.size();i++)
                {
                    begin = 0;
                    int j = 0;
                    do
                    {
                        end = faces[i].find_first_of("/", begin);

                        if(begin < end)
                        {
                            vnt[2][j] = StrToInt(faces[i].substr(begin, end-begin))-1;
                        }
                        else
                            vnt[2][j] = -1;
                        begin = end+1;
                        j++;

                    }while(end != string::npos);

                    for(int j = 0;j < 3;j++)
                    {
                        mesh->m_vertexIndices.push_back(vnt[j][0]);

                        if(vnt[j][1] != -1)
                            mesh->m_textureCoordIndices.push_back(vnt[j][1]);
                        if(vnt[j][2] != -1)
                            mesh->m_normalIndices.push_back(vnt[j][2]);
                    }

                    memcpy(&vnt[1], &vnt[2], sizeof(int)*3);
                }
                break;
        }
    }

    mesh->m_haveNormals =
        mesh->m_normalIndices.size() == mesh->m_vertexIndices.size();
    mesh->m_haveTexCoords =
        mesh->m_textureCoordIndices.size() == mesh->m_vertexIndices.size();

    mesh->m_size = mesh->m_endCorner - mesh->m_beginCorner;
    return mesh;
}

Mesh::~Mesh() {

}

int Mesh::StrToInt(const string &str)
{
    stringstream ss;
    int i;
    ss << str;
    ss >> i;
    return i;
}

vector<string> Mesh::split_string(const string& str, const string& split_str)
{
    vector<string> stlv_string;
    string part_string("");
    string::size_type i;

    i=0;
    while(i < str.size())
    {
        if(split_str.find(str[i]) != string::npos)
        {
            stlv_string.push_back(part_string);
            part_string="";
            while(split_str.find(str[i]) != string::npos)
            {
                ++i;
            }
        }
        else
        {
            part_string += str[i];
            ++i;
        }
    }
    if (!part_string.empty())
        stlv_string.push_back(part_string);
    return stlv_string;
}

void Mesh::render() {
    Vec3<float> * v;
    Vec2<float> * v2;

    if( m_texture ) {
        m_texture->bind();
    } else {
        glDisable(GL_TEXTURE_2D);
    }

    glBegin(GL_TRIANGLES);
        for(unsigned int i=0; i<m_vertexIndices.size(); ++i) {
            if( m_haveColors ) {
                v = &m_colors[m_colorIndices[i]];
                glColor3f(v->x,v->y,v->z);
            }
            if( m_haveNormals ) {
                v = &m_normals[m_normalIndices[i]];
                glNormal3f(v->x,v->y,v->z);
            }
            if( m_haveTexCoords ) {
                v2 = &m_textureCoords[m_textureCoordIndices[i]];
                glTexCoord2f(v2->x,v2->y);
            }

            v = &m_vertices[m_vertexIndices[i]];
            glVertex3f(v->x,v->y,v->z);
        }
    glEnd();
}

Mesh * Mesh::createUnitCylinder(Vec3<float> color, Texture * tex,
    int numSides)
{
    Mesh * mesh = createUnitCylinder(color, numSides);
    mesh->m_texture = tex;
    return mesh;
}

Mesh * Mesh::createUnitCylinder(Vec3<float> color, int numSides) {
    Mesh * mesh = new Mesh();
    // vertices
    for (float side = -1.0; side <= 1.0; side += 2.0) {
        float z = 0.5 * side;
        mesh->m_normals.push_back(Vec3<float>(0, 0, z*2));
        mesh->m_vertices.push_back(Vec3<float>(0.0f, 0.0f, z)); // center
        mesh->m_textureCoords.push_back(Vec2<float>(0.5f, 0.5f));
        for (int i = 0; i < numSides; i++) {
            float angle = 2 * M_PI * i / numSides * side;
            mesh->m_normals.push_back(Vec3<float>(cosf(angle), sinf(angle), 0));
            mesh->m_vertices.push_back(
                Vec3<float>(cosf(angle) / 2.0f, sinf(angle) / 2.0f, z));
            mesh->m_textureCoords.push_back(Vec2<float>(0.5f+cosf(angle)/2.0f, 0.5f+sinf(angle) / 2.0f));
        }
    }
    // index caps
    for (int side = 0; side <= numSides + 1; side += numSides + 1) {
        for (int i = 0; i < numSides - 1; i++) {
            triangle(mesh->m_vertexIndices, side, side + i + 1, side + i + 2);
            triangle(mesh->m_normalIndices, side, side + i + 1, side + i + 2);
            triangle(mesh->m_textureCoordIndices, side, side + i + 1,
                side + i + 2);
        }
        triangle(mesh->m_vertexIndices, side, side + numSides, side + 1);
        triangle(mesh->m_normalIndices, side, side + numSides, side + 1);
        triangle(mesh->m_textureCoordIndices, side, side + numSides, side + 1);
    }
    // index sides
    quad(mesh->m_vertexIndices, 1, numSides + 2, 2 * numSides + 1, 2);
    quad(mesh->m_normalIndices, 1, numSides + 2, 2 * numSides + 1, 2);
    for (int i = 1; i < numSides - 1; i++) {
        quad(mesh->m_vertexIndices, i + 1, 2 * numSides + 2 - i,
            2 * numSides + 2 - i - 1, i + 1 + 1);
        quad(mesh->m_normalIndices, i + 1, 2 * numSides + 2 - i,
            2 * numSides + 2 - i - 1, i + 1 + 1);
    }
    quad(mesh->m_vertexIndices, numSides, numSides + 3, numSides + 2, 1);
    quad(mesh->m_normalIndices, numSides, numSides + 3, numSides + 2, 1);

    // texture sides
    unsigned int topBase = mesh->m_textureCoords.size();
    for(int i=0; i <= numSides; ++i) {
        mesh->m_textureCoords.push_back(
            Vec2<float>((float)i / (float)numSides,1.0f));
    }
    unsigned int bottomBase = mesh->m_textureCoords.size();
    for(int i=0; i <= numSides; ++i) {
        mesh->m_textureCoords.push_back(
            Vec2<float>((float)i / (float)numSides,0.0f));
    }
    for(int i=0; i <= numSides; ++i) {
        quad(mesh->m_textureCoordIndices, topBase+i, bottomBase+i,
            bottomBase+i+1, topBase+i+1);
    }


    // color
    mesh->m_colors.push_back(color);
    for (int i = 0; i < numSides * 6 * 2; i++)
        mesh->m_colorIndices.push_back(0);

    mesh->m_haveColors = true;
    mesh->m_haveNormals = true;
    mesh->m_haveTexCoords = true;

    mesh->m_size = Vec3<float>(1.0f, 1.0f, 1.0f);
    mesh->m_beginCorner = Vec3<float>(-0.5f, -0.5f, -0.5f);
    mesh->m_endCorner = Vec3<float>(0.5f, 0.5f, 0.5f);
    return mesh;
}

Mesh * Mesh::createUnitCube(Vec3<float> color, Texture * tex_top, Texture * tex_bottom,
                            Texture * tex_front, Texture * tex_back,
                            Texture * tex_left, Texture * tex_right)
{
    Mesh * mesh = createUnitCube(color, tex_top);
    return mesh;
}

Mesh * Mesh::createUnitCube(Vec3<float> color, Texture * tex) {
    Mesh * mesh = createUnitCube(color);
    mesh->m_texture = tex;
    return mesh;
}

Mesh * Mesh::createUnitCube(Vec3<float> color) {
    Mesh* mesh = new Mesh();
    // baseball lace pattern
    mesh->m_vertices.push_back(Vec3<float>(-0.5f, -0.5f, -0.5f));
    mesh->m_vertices.push_back(Vec3<float>( 0.5f, -0.5f, -0.5f));
    mesh->m_vertices.push_back(Vec3<float>( 0.5f,  0.5f, -0.5f));
    mesh->m_vertices.push_back(Vec3<float>(-0.5f,  0.5f, -0.5f));
    mesh->m_vertices.push_back(Vec3<float>(-0.5f,  0.5f,  0.5f));
    mesh->m_vertices.push_back(Vec3<float>( 0.5f,  0.5f,  0.5f));
    mesh->m_vertices.push_back(Vec3<float>( 0.5f, -0.5f,  0.5f));
    mesh->m_vertices.push_back(Vec3<float>(-0.5f, -0.5f,  0.5f));

    mesh->m_normals.push_back(Vec3<float>( 0, 0,-1)); // -z
    mesh->m_normals.push_back(Vec3<float>(-1, 0, 0)); // -x
    mesh->m_normals.push_back(Vec3<float>( 0,-1, 0)); // -y
    mesh->m_normals.push_back(Vec3<float>( 1, 0, 0)); // +x
    mesh->m_normals.push_back(Vec3<float>( 0, 1, 0)); // +y
    mesh->m_normals.push_back(Vec3<float>( 0, 0, 1)); // +z

    for( int side=0; side<6; ++side ) {
        for( int i=0; i<6; ++i )
            mesh->m_normalIndices.push_back(side);
    }

    quad(mesh->m_vertexIndices, 3, 2, 1, 0); // -z
    quad(mesh->m_vertexIndices, 3, 0, 7, 4); // -x
    quad(mesh->m_vertexIndices, 0, 1, 6, 7); // -y
    quad(mesh->m_vertexIndices, 1, 2, 5, 6); // +x
    quad(mesh->m_vertexIndices, 2, 3, 4, 5); // +y
    quad(mesh->m_vertexIndices, 5, 4, 7, 6); // +z

    // texture coordinates
    mesh->m_textureCoords.push_back(Vec2<float>(0.0f, 0.0f));
    mesh->m_textureCoords.push_back(Vec2<float>(1.0f, 0.0f));
    mesh->m_textureCoords.push_back(Vec2<float>(1.0f, 1.0f));
    mesh->m_textureCoords.push_back(Vec2<float>(0.0f, 1.0f));

    for(int side=0; side<6; ++side) {
        mesh->m_textureCoordIndices.push_back(0);
        mesh->m_textureCoordIndices.push_back(1);
        mesh->m_textureCoordIndices.push_back(2);
        mesh->m_textureCoordIndices.push_back(0);
        mesh->m_textureCoordIndices.push_back(2);
        mesh->m_textureCoordIndices.push_back(3);
    }

    // all the colors are the same
    mesh->m_colors.push_back(color);
    for (unsigned int i = 0; i < mesh->m_vertexIndices.size(); i++)
        mesh->m_colorIndices.push_back(0);

    mesh->m_haveColors = true;
    mesh->m_haveNormals = true;
    mesh->m_haveTexCoords = true;
    mesh->m_size = Vec3<float>(1.0f, 1.0f, 1.0f);
    mesh->m_beginCorner = Vec3<float>(-0.5f, -0.5f, -0.5f);
    mesh->m_endCorner = Vec3<float>(0.5f, 0.5f, 0.5f);
    return mesh;
}

Mesh * Mesh::createUnitPlane(Vec3<float> color, Texture * tex) {
    Mesh * mesh = createUnitPlane(color);
    mesh->m_texture = tex;
    return mesh;
}

Mesh * Mesh::createUnitPlane(Vec3<float> color) {
    Mesh * mesh = new Mesh();

    mesh->m_vertices.push_back(Vec3<float>(-0.5f, -0.5f, 0));
    mesh->m_vertices.push_back(Vec3<float>(-0.5f,  0.5f, 0));
    mesh->m_vertices.push_back(Vec3<float>( 0.5f,  0.5f, 0));
    mesh->m_vertices.push_back(Vec3<float>( 0.5f, -0.5f, 0));

    // 1,2,3; 1,3,4
    quad(mesh->m_vertexIndices, 3, 2, 1, 0);

    // texture coords
    mesh->m_textureCoords.push_back(Vec2<float>(0.0f, 0.0f));
    mesh->m_textureCoords.push_back(Vec2<float>(1.0f, 0.0f));
    mesh->m_textureCoords.push_back(Vec2<float>(1.0f, 1.0f));
    mesh->m_textureCoords.push_back(Vec2<float>(0.0f, 1.0f));

    mesh->m_textureCoordIndices.push_back(2);
    mesh->m_textureCoordIndices.push_back(1);
    mesh->m_textureCoordIndices.push_back(0);
    mesh->m_textureCoordIndices.push_back(2);
    mesh->m_textureCoordIndices.push_back(0);
    mesh->m_textureCoordIndices.push_back(3);

    // same colors and normals
    mesh->m_colors.push_back(color);
    mesh->m_normals.push_back(Vec3<float>(0, 0, 1));
    for(unsigned int i=0; i < mesh->m_vertexIndices.size(); ++i){
        mesh->m_colorIndices.push_back(0);
        mesh->m_normalIndices.push_back(0);
    }

    mesh->m_haveColors = true;
    mesh->m_haveNormals = true;
    mesh->m_haveTexCoords = true;
    mesh->m_size = Vec3<float>(1.0f, 1.0f, 0);
    mesh->m_beginCorner = Vec3<float>(-0.5f, -0.5f, 0);
    mesh->m_endCorner = Vec3<float>(0.5f, 0.5f, 0);
    return mesh;
}

void Mesh::quad(vector<int> & array, int v1, int v2, int v3, int v4) {
    triangle(array, v1, v2, v3);
    triangle(array, v1, v3, v4);
}

void Mesh::triangle(vector<int> & array, int v1, int v2, int v3)
{
    array.push_back(v1);
    array.push_back(v2);
    array.push_back(v3);
}

void Mesh::calculatePerSurface(bool normalize){
    int index = 0;
    m_normals.clear();
    m_normalIndices.clear();
    for(unsigned int i=0; i<m_vertexIndices.size(); i+=3){
        // make two edge vectors
        Vec3<float> edge1 = m_vertices[m_vertexIndices[i]]
            - m_vertices[m_vertexIndices[i+1]];
        Vec3<float> edge2 = m_vertices[m_vertexIndices[i+1]]
            - m_vertices[m_vertexIndices[i+2]];

        // cross product is normal
        m_normals.push_back(edge1.cross(edge2));
        if( normalize ) m_normals[m_normals.size()-1].normalize();

        m_normalIndices.push_back(index);
        m_normalIndices.push_back(index);
        m_normalIndices.push_back(index);

        ++index;
    }
}

void Mesh::calculateNormals(MeshCalculations::CalcNormalMethod mode,
    int creaseAngle)
{
    m_normalMode = mode;

    if( mode == Surface ) {
        calculatePerSurface(true);
    } else {
        calculatePerSurface(mode == MeshCalculations::Average);
        // init
        vector<vector<int>*> vertexToFace;
        for (unsigned int i = 0; i < m_vertices.size(); i++)
            vertexToFace.push_back(new vector<int>());

        // map vertices to faces
        for (unsigned int f = 0; f < m_vertexIndices.size(); f += 3)
            for (int v = 0; v < 3; v++)
                vertexToFace[m_vertexIndices[f + v]]->push_back(f);

        // calc new m_normals
        vector< Vec3<float> > newm_normals;
        for (unsigned int v = 0; v < vertexToFace.size(); v++) {
            vector<int> * faces = vertexToFace[v];
            Vec3<float> normal(0.0f);
            for (unsigned int f = 0; f < faces->size(); f++)
                normal += m_normals[m_normalIndices[(*faces)[f]]];
            normal.normalize();
            newm_normals.push_back(normal);
        }

        // use new m_normals
        m_normals.clear();
        for (unsigned int i = 0; i < newm_normals.size(); i++)
            m_normals.push_back(newm_normals[i]);
        m_normalIndices.clear();
        for (unsigned int i = 0; i < m_vertexIndices.size(); i++)
            m_normalIndices.push_back(m_vertexIndices[i]);

        // cleanup
        for (unsigned int i = 0; i < vertexToFace.size(); i++)
            delete vertexToFace[i];

    }
    calcCreasedNormals(creaseAngle);
}

void Mesh::calcCreasedNormals(int creaseAngle) {
    float pi = 4.0f * atanf(1.0f);
    float threshold = pi * creaseAngle / 180.0f;

    // init
    vector<vector<int>*> vertexToFace;
    for (unsigned int i = 0; i < m_vertices.size(); i++)
        vertexToFace.push_back(new vector<int>());

    // map m_vertices to faces
    for (unsigned int f = 0; f < m_vertexIndices.size(); f += 3)
        for (int v = 0; v < 3; v++)
            vertexToFace[m_vertexIndices[f + v]]->push_back(f);

    // angles are indexed the same as m_vertices
    vector< Vec3<float> > newm_normals;
    for (unsigned int f = 0; f < m_vertexIndices.size(); f += 3) {
        for (int v = 0; v < 3; v++) {
            Vec3<float> oldNormal = m_normals[m_normalIndices[f]];
            Vec3<float> newNormal = oldNormal;
            bool renormalizePlease = true;
            vector<int> * faces = vertexToFace[m_vertexIndices[f + v]];
            for (int n = 0; n < 2; n++) {
                // find the neighbor faces and maybe average them
                vector<int> * wingFaces = vertexToFace[m_vertexIndices[f + (v + n + 1) % 3]];
                int neighborFace = -1;
                for (unsigned int i = 0; i < faces->size(); i++) {
                    int face = (*faces)[i];
                    if ((unsigned int)face == f)
                        continue; // that's this face. we know we share this one.
                    for (unsigned int j = 0; j < wingFaces->size(); j++) {
                        if (face == (*wingFaces)[j]) {
                            neighborFace = face;
                            goto breakToHere;
                        }
                    }
                }
                breakToHere:
                if (neighborFace == -1)
                    continue; // this edge only has one face
                Vec3<float> neighborNormal = m_normals[m_normalIndices[neighborFace]];
                float angle = getAngle(oldNormal, neighborNormal);
                if (angle <= threshold) {
                    newNormal += neighborNormal;
                    renormalizePlease = true;
                }
            }
            if (renormalizePlease)
                newNormal.normalize();
            newm_normals.push_back(newNormal);
        }
    }

    m_normals.clear();
    m_normalIndices.clear();
    for (unsigned int i = 0; i < newm_normals.size(); i++) {
        m_normals.push_back(newm_normals[i]);
        m_normalIndices.push_back(i);
    }

    // cleanup
    for (unsigned int i = 0; i < vertexToFace.size(); i++)
        delete vertexToFace[i];
}

void Mesh::setShowNormals(bool value) {
    m_showNormals = value;
}

float Mesh::getAngle(Vec3<float> v1, Vec3<float> v2) {
    return acosf(v1.normalized().dot(v2.normalized()));
}

void Mesh::drawNormalArrows(Vec3<float> scale) {
    if( ! m_showNormals ) return;

    const float normalLength = 1.0f;
    glDisable(GL_TEXTURE_2D);
    glColor3f(1.0f, 0.0f, 0.0f);
    glBegin(GL_LINES);
        switch(m_normalMode){
            case MeshCalculations::Surface:
                for( unsigned int f = 0; f < m_vertexIndices.size(); f += 3){
                    // get the surface center
                    Vec3<float> vertex(0.0f, 0.0f, 0.0f);
                    for( int v = 0; v < 3; ++v ) {
                        vertex += m_vertices[m_vertexIndices[f+v]];
                    }
                    vertex /= 3;
                    glVertex3f(vertex.x, vertex.y, vertex.z);

                    // add normal vector
                    Vec3<float> normal =
                        m_normals[m_normalIndices[f]].normalized();
                    normal /= scale;
                    vertex += normalLength * normal;
                    glVertex3f(vertex.x, vertex.y, vertex.z);
                }
                break;
            case MeshCalculations::Average:
            case MeshCalculations::WeightedAverage:
                for( unsigned int i = 0; i < m_normalIndices.size(); ++i){
                    Vec3<float> v = m_vertices[m_vertexIndices[i]];
                    glVertex3f(v.x, v.y, v.z);
                    Vec3<float> normal = m_normals[m_normalIndices[i]];
                    normal /= scale;
                    v += normalLength * normal;
                    glVertex3f(v.x, v.y, v.z);
                }
                break;
        }
    glEnd();
}
