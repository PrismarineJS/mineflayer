#include <QApplication>
#include <QStringList>

#include "MetaTypes.h"
#include "MainWindow.h"
#include "ScriptRunner.h"

void printUsage(QString app_name);

int main(int argc, char *argv[])
{
    QApplication a(argc, argv);

    // parse arguments
    bool script_debug = false;
    bool headless = true;
    QString script_file;

    QStringList args = a.arguments();
    for (int i = 1; i < args.size(); i++) {
        QString arg = args.at(i);
        if (arg == "--debug") {
            script_debug = true;
        } else if (arg == "--3d") {
            headless = false;
        } else if (arg.startsWith("--")) {
            qWarning() << "Unrecognized option: " << arg;
            printUsage(args.at(0));
            return -1;
        } else {
            if (script_file.isEmpty()) {
                script_file = arg;
            } else {
                qWarning() << "Don't know what to do with 2 input files.";
                printUsage(args.at(0));
                return -1;
            }
        }
    }

    MetaTypes::registerMetaTypes();

    if (! script_file.isEmpty()) {
        ScriptRunner runner(script_file, script_debug, headless);
        if (! runner.go())
            return -1;
        if (headless)
            return a.exec();
    }
    MainWindow w;
    return w.exec();
}

void printUsage(QString app_name)
{
    qWarning() << "Usage:" << app_name << "[--debug] [--3d] script.js";
}
