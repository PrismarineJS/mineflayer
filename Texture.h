#ifndef _TEXTURE_H_
#define _TEXTURE_H_

#include <QImage>

class Texture {
    public:
        enum Mode {
            ModeReplace,
            ModeBlend,
            ModeOff
        };

        enum FilterMode {
            FilterModeSimple,
            FilterModeSmooth
        };

        Texture(QImage image);
        ~Texture();

        static void setMode(Mode mode);
        static void setFilterMode(FilterMode mode);

        inline QImage image() { return m_image; }
        void bind();
    private:
        QImage m_image;
        unsigned int m_id;

        static Mode s_mode;
};

#endif

