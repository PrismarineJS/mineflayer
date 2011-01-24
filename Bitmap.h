#ifndef _BITMAP_H_
#define _BITMAP_H_

#include <string>
using namespace std;

class Bitmap {
    public: 
        Bitmap(string file);
        ~Bitmap();

        inline unsigned char * buffer() { return m_bits; }

        inline int width() { return m_info->bmiHeader.biWidth; }
        inline int height() { return m_info->bmiHeader.biHeight; }

    private:
        static const short int WIN_BF_TYPE;

        enum BitmapCompression {
            WIN_BI_RGB,                /* No compression - straight BGR data */
            WIN_BI_RLE8,               /* 8-bit run-length compression */
            WIN_BI_RLE4,               /* 4-bit run-length compression */
            WIN_BI_BITFIELDS           /* RGB bitmap with RGB masks */
        };


        typedef struct
        {
            unsigned short bfType;           /* Magic number for file */
            unsigned int   bfSize;           /* Size of file */
            unsigned short bfReserved1;      /* Reserved */
            unsigned short bfReserved2;      /* ... */
            unsigned int   bfOffBits;        /* Offset to bitmap data */
        } WIN_BITMAPFILEHEADER;

        typedef struct
        {
            unsigned int   biSize;           /* Size of info header */
            int            biWidth;          /* Width of image */
            int            biHeight;         /* Height of image */
            unsigned short biPlanes;         /* Number of color planes */
            unsigned short biBitCount;       /* Number of bits per pixel */
            unsigned int   biCompression;    /* Type of compression to use */
            unsigned int   biSizeImage;      /* Size of image data */
            int            biXPelsPerMeter;  /* X pixels per meter */
            int            biYPelsPerMeter;  /* Y pixels per meter */
            unsigned int   biClrUsed;        /* Number of colors used */
            unsigned int   biClrImportant;   /* Number of important colors */
        } WIN_BITMAPINFOHEADER;

        typedef struct
        {
            unsigned char  rgbBlue;          /* Blue value */
            unsigned char  rgbGreen;         /* Green value */
            unsigned char  rgbRed;           /* Red value */
            unsigned char  rgbReserved;      /* Reserved */
        } WIN_RGBQUAD;

        typedef struct
        {
            WIN_BITMAPINFOHEADER bmiHeader;      /* Image header */
            WIN_RGBQUAD          bmiColors[256]; /* Image colormap */
        } WIN_BITMAPINFO;

        static unsigned char *LoadDIBitmap(const char *filename,
            WIN_BITMAPINFO **info);
        static int SaveDIBitmap(const char *filename, WIN_BITMAPINFO *info,
            unsigned char *bits);

        unsigned char * m_bits;
        WIN_BITMAPINFO * m_info;

        static unsigned short read_word(FILE *fp);
        static unsigned int   read_dword(FILE *fp);
        static int            read_long(FILE *fp);

        static int            write_word(FILE *fp, unsigned short w);
        static int            write_dword(FILE *fp, unsigned int dw);
        static int            write_long(FILE *fp, int l);


};

#endif

