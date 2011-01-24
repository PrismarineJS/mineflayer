#include "Drawable.h"

#include <iostream>
using namespace std;

#include <QtOpenGL>

Drawable::Drawable() :
    m_useListRendering(false)
{
    // allocate a glList
    m_listId = glGenLists(1);
}

Drawable::~Drawable() {
    // deallocate the glList
    glDeleteLists(m_listId, 1);
}

void Drawable::setListRendering(bool value) {
    m_useListRendering = value;

    if( value ) {
        // pre-render the object
        glNewList(m_listId, GL_COMPILE);
            render();
        glEndList();
    }
}

void Drawable::refreshList() {
    if( m_useListRendering ) {
        glDeleteLists(m_listId, 1);
        // pre-render the object
        glNewList(m_listId, GL_COMPILE);
            render();
        glEndList();
    }
}

void Drawable::draw() {
    if( m_useListRendering )
        glCallList(m_listId);
    else
        render();
}
