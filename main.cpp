#include <QCoreApplication>

#include "MetaTypes.h"
#include "MineflayerApplication.h"

int main(int argc, char *argv[])
{
    QCoreApplication a(argc, argv);
    MetaTypes::registerMetaTypes();
    MineflayerApplication w;
    w.go();
    return 0;
}
