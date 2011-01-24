// Drawable - objects that can be rendered with OpenGL

#ifndef _DRAWABLE_H_
#define _DRAWABLE_H_

class Drawable {
    public:
        Drawable();
        virtual ~Drawable();

        // actually draws the object to opengl
        void draw();

        // turn list rendering on or off
        void setListRendering(bool value);

        // rerender
        void refreshList();


    protected:
        // call opengl commands, might get stored in a glList
        virtual void render() = 0;

    private:
        bool m_useListRendering;
        int m_listId;

};

#endif

