#include <QCoreApplication>

#include "MetaTypes.h"
#include "MainWindow.h"

int main(int argc, char *argv[])
{
    QCoreApplication a(argc, argv);
    MetaTypes::registerMetaTypes();
    MainWindow w;
    w.go();
    return 0;
}
