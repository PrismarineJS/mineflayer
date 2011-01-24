#include "Bitmap.h"

#include <cstdio>
#include <cstdlib>
#include <cerrno>
using namespace std;

const short int Bitmap::WIN_BF_TYPE = 0x4D42;

Bitmap::Bitmap(string file) :
    m_bits(NULL),
    m_info(NULL)
{
    m_bits = LoadDIBitmap(file.c_str(), &m_info);
}

Bitmap::~Bitmap() {
    if( m_bits )
        delete m_bits;

    if( m_info )
        delete m_info; 
}


unsigned char * Bitmap::LoadDIBitmap(const char *filename, WIN_BITMAPINFO **info)  
{
    FILE             *fp;          /* Open file pointer */
    unsigned char          *bits;        /* Bitmap pixel bits */
    unsigned char          *ptr;         /* Pointer into bitmap */
    unsigned char          temp;         /* Temporary variable to swap red and blue */
    int              x, y;         /* X and Y position in image */
    int              length;       /* Line length */
    int              bitsize;      /* Size of bitmap */
    int              infosize;     /* Size of header information */
    WIN_BITMAPFILEHEADER header;       /* File header */


    /* Try opening the file; use "rb" mode to read this *binary* file. */
    if ((fp = fopen(filename, "rb")) == NULL)
        return (NULL);

    /* Read the file header and any following bitmap information... */
    header.bfType      = read_word(fp);
    header.bfSize      = read_dword(fp);
    header.bfReserved1 = read_word(fp);
    header.bfReserved2 = read_word(fp);
    header.bfOffBits   = read_dword(fp);

    if (header.bfType != WIN_BF_TYPE) /* Check for BM reversed... */
    {
        /* Not a bitmap file - return NULL... */
        fclose(fp);
        return (NULL);
    }

    infosize = header.bfOffBits - 18;
    if ((*info = (WIN_BITMAPINFO *)malloc(sizeof(WIN_BITMAPINFO))) == NULL)
    {
        /* Couldn't allocate memory for bitmap info - return NULL... */
        fclose(fp);
        return (NULL);
    }

    (*info)->bmiHeader.biSize          = read_dword(fp);
    (*info)->bmiHeader.biWidth         = read_long(fp);
    (*info)->bmiHeader.biHeight        = read_long(fp);
    (*info)->bmiHeader.biPlanes        = read_word(fp);
    (*info)->bmiHeader.biBitCount      = read_word(fp);
    (*info)->bmiHeader.biCompression   = read_dword(fp);
    (*info)->bmiHeader.biSizeImage     = read_dword(fp);
    (*info)->bmiHeader.biXPelsPerMeter = read_long(fp);
    (*info)->bmiHeader.biYPelsPerMeter = read_long(fp);
    (*info)->bmiHeader.biClrUsed       = read_dword(fp);
    (*info)->bmiHeader.biClrImportant  = read_dword(fp);

    if (infosize > 40)
        if (fread((*info)->bmiColors, infosize - 40, 1, fp) < 1)
        {
            /* Couldn't read the bitmap header - return NULL... */
            free(*info);
            fclose(fp);
            return (NULL);
        }

    /* Now that we have all the header info read in, allocate memory for *
     * the bitmap and read *it* in...                                    */
    if ((bitsize = (*info)->bmiHeader.biSizeImage) == 0)
        bitsize = ((*info)->bmiHeader.biWidth *
                (*info)->bmiHeader.biBitCount + 7) / 8 *
            abs((*info)->bmiHeader.biHeight);

    if ((bits = (unsigned char * )malloc(bitsize)) == NULL)
    {
        /* Couldn't allocate memory - return NULL! */
        free(*info);
        fclose(fp);
        return (NULL);
    }

    if (fread(bits, 1, bitsize, fp) < (unsigned int) bitsize)
    {
        /* Couldn't read bitmap - free memory and return NULL! */
        free(*info);
        free(bits);
        fclose(fp);
        return (NULL);
    }

    /* Swap red and blue */
    length = ((*info)->bmiHeader.biWidth * 3 + 3) & ~3;
    for (y = 0; y < (*info)->bmiHeader.biHeight; y ++)
        for (ptr = bits + y * length, x = (*info)->bmiHeader.biWidth;
                x > 0;
                x --, ptr += 3)
        {
            temp   = ptr[0];
            ptr[0] = ptr[2];
            ptr[2] = temp;
        }

    /* OK, everything went fine - return the allocated bitmap... */
    fclose(fp);
    return (bits);
}


/*
 * 'SaveDIBitmap()' - Save a DIB/BMP file to disk.
 *
 * Returns 0 on success or -1 on failure...
 */

int Bitmap::SaveDIBitmap(const char *filename, /* I - File to load */
        WIN_BITMAPINFO *info,     /* I - Bitmap information */
        unsigned char    *bits)     /* I - Bitmap data */
{
    FILE *fp;                      /* Open file pointer */
    int  size,                     /* Size of file */
         infosize,                 /* Size of bitmap info */
         bitsize;                  /* Size of bitmap pixels */


    /* Try opening the file; use "wb" mode to write this *binary* file. */
    if ((fp = fopen(filename, "wb")) == NULL)
        return (-1);

    /* Figure out the bitmap size */
    if (info->bmiHeader.biSizeImage == 0)
        bitsize = (info->bmiHeader.biWidth *
                info->bmiHeader.biBitCount + 7) / 8 *
            abs(info->bmiHeader.biHeight);
    else
        bitsize = info->bmiHeader.biSizeImage;

    /* Figure out the header size */
    infosize = sizeof(WIN_BITMAPINFOHEADER);
    switch (info->bmiHeader.biCompression)
    {
        case WIN_BI_BITFIELDS :
            infosize += 12; /* Add 3 RGB doubleword masks */
            if (info->bmiHeader.biClrUsed == 0)
                break;
        case WIN_BI_RGB :
            if (info->bmiHeader.biBitCount > 8 &&
                    info->bmiHeader.biClrUsed == 0)
                break;
        case WIN_BI_RLE8 :
        case WIN_BI_RLE4 :
            if (info->bmiHeader.biClrUsed == 0)
                infosize += (1 << info->bmiHeader.biBitCount) * 4;
            else
                infosize += info->bmiHeader.biClrUsed * 4;
            break;
    }

    size = sizeof(WIN_BITMAPFILEHEADER) + infosize + bitsize;

    /* Write the file header, bitmap information, and bitmap pixel data... */
    write_word(fp, WIN_BF_TYPE);        /* bfType */
    write_dword(fp, size);          /* bfSize */
    write_word(fp, 0);              /* bfReserved1 */
    write_word(fp, 0);              /* bfReserved2 */
    write_dword(fp, 18 + infosize); /* bfOffBits */

    write_dword(fp, info->bmiHeader.biSize);
    write_long(fp, info->bmiHeader.biWidth);
    write_long(fp, info->bmiHeader.biHeight);
    write_word(fp, info->bmiHeader.biPlanes);
    write_word(fp, info->bmiHeader.biBitCount);
    write_dword(fp, info->bmiHeader.biCompression);
    write_dword(fp, info->bmiHeader.biSizeImage);
    write_long(fp, info->bmiHeader.biXPelsPerMeter);
    write_long(fp, info->bmiHeader.biYPelsPerMeter);
    write_dword(fp, info->bmiHeader.biClrUsed);
    write_dword(fp, info->bmiHeader.biClrImportant);

    if (infosize > 40)
        if (fwrite(info->bmiColors, infosize - 40, 1, fp) < 1)
        {
            /* Couldn't write the bitmap header - return... */
            fclose(fp);
            return (-1);
        }

    if (fwrite(bits, 1, bitsize, fp) < (unsigned int)bitsize)
    {
        /* Couldn't write the bitmap - return... */
        fclose(fp);
        return (-1);
    }

    /* OK, everything went fine - return... */
    fclose(fp);
    return (0);
}


/*
 * 'read_word()' - Read a 16-bit unsigned integer.
 */

unsigned short Bitmap::read_word(FILE *fp)       /* I - File to read from */
{
    unsigned char b0, b1; /* Bytes from file */

    b0 = getc(fp);
    b1 = getc(fp);

    return ((b1 << 8) | b0);
}


/*
 * 'read_dword()' - Read a 32-bit unsigned integer.
 */

unsigned int Bitmap::read_dword(FILE *fp)              /* I - File to read from */
{
    unsigned char b0, b1, b2, b3; /* Bytes from file */

    b0 = getc(fp);
    b1 = getc(fp);
    b2 = getc(fp);
    b3 = getc(fp);

    return ((((((b3 << 8) | b2) << 8) | b1) << 8) | b0);
}


/*
 * 'read_long()' - Read a 32-bit signed integer.
 */

int Bitmap::read_long(FILE *fp)               /* I - File to read from */
{
    unsigned char b0, b1, b2, b3; /* Bytes from file */

    b0 = getc(fp);
    b1 = getc(fp);
    b2 = getc(fp);
    b3 = getc(fp);

    return ((int)(((((b3 << 8) | b2) << 8) | b1) << 8) | b0);
}


/*
 * 'write_word()' - Write a 16-bit unsigned integer.
 */

int Bitmap::write_word(FILE           *fp, /* I - File to write to */
        unsigned short w)   /* I - Integer to write */
{
    putc(w, fp);
    return (putc(w >> 8, fp));
}


/*
 * 'write_dword()' - Write a 32-bit unsigned integer.
 */

int Bitmap::write_dword(FILE         *fp, /* I - File to write to */
        unsigned int dw)  /* I - Integer to write */
{
    putc(dw, fp);
    putc(dw >> 8, fp);
    putc(dw >> 16, fp);
    return (putc(dw >> 24, fp));
}


/*
 * 'write_long()' - Write a 32-bit signed integer.
 */

int Bitmap::write_long(FILE *fp, /* I - File to write to */
        int  l)   /* I - Integer to write */
{
    putc(l, fp);
    putc(l >> 8, fp);
    putc(l >> 16, fp);
    return (putc(l >> 24, fp));
}
