#include "Texture.h"

#include <cmath>
using namespace std;

#include <QtOpenGL>

Texture::Mode Texture::s_mode = ModeReplace;

Texture::Texture(QImage image)
    : m_image(image)
{
    glGenTextures(1, &m_id);
    glEnable(GL_TEXTURE_2D);
    glBindTexture(GL_TEXTURE_2D, m_id);
    glPixelStorei(GL_UNPACK_ALIGNMENT, 1);
    setFilterMode(FilterModeSimple);
    // create mipmaps
    gluBuild2DMipmaps(
        GL_TEXTURE_2D,
        GL_RGBA,
        image.width(),
        image.height(),
        GL_RGBA,
        GL_UNSIGNED_BYTE,
        image.bits()
    );
}

Texture::~Texture() {
    glDeleteTextures(1, &m_id);
}


void Texture::bind() {
    if( s_mode != ModeOff ) {
        glEnable(GL_TEXTURE_2D);
        glBindTexture(GL_TEXTURE_2D, m_id);
    }
    switch(s_mode){
        case ModeReplace:
            glTexEnvf(GL_TEXTURE_ENV, GL_TEXTURE_ENV_MODE, GL_REPLACE);
            break;
        case ModeBlend:
            glTexEnvf(GL_TEXTURE_ENV, GL_TEXTURE_ENV_MODE, GL_BLEND);
            break;
        case ModeOff:
            glDisable(GL_TEXTURE_2D);
            break;
    }
}

void Texture::setMode(Mode mode) {
    s_mode = mode;
}

void Texture::setFilterMode(FilterMode mode){
    switch(mode){
        case FilterModeSimple:
            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
            break;
        case FilterModeSmooth:
            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER,
                GL_LINEAR_MIPMAP_LINEAR);
            break;
    }
}
