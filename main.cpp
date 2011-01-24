#include <QtGui/QApplication>
#include "MainWindow.h"

#include "MetaTypes.h"

int main(int argc, char *argv[])
{
    QApplication a(argc, argv);
    MetaTypes::registerMetaTypes();
    MainWindow w;
    w.start();
    return a.exec();
}
