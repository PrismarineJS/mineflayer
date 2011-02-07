#include <QApplication>
#include <QStringList>
#include <QUrl>

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
    QUrl url = QUrl::fromUserInput("mineflayer@localhost:25565");
    QString password;

    QStringList args = a.arguments();
    for (int i = 1; i < args.size(); i++) {
        QString arg = args.at(i);
        if (arg == "--debug") {
            script_debug = true;
        } else if (arg == "--3d") {
            headless = false;
        } else if (arg == "--url") {
            if (i+1 >= args.size()) {
                printUsage(args.at(0));
                return -1;
            }
            url = QUrl::fromUserInput(args.at(++i));
            if (! url.password().isEmpty())
                password = url.password();
        } else if (arg == "--password") {
            if (i+1 >= args.size()) {
                printUsage(args.at(0));
                return -1;
            }
            password = args.at(++i);
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
    url.setPassword(password);
    url.setPort(url.port(25565));

    MetaTypes::registerMetaTypes();

    if (! script_file.isEmpty()) {
        ScriptRunner runner(url, script_file, script_debug, headless);
        if (! runner.go())
            return -1;
        if (headless)
            return a.exec();
    }
    MainWindow w(url);
    return w.exec();
}

void printUsage(QString app_name)
{
    qWarning() << "Usage:" << app_name << "[--debug] [--3d] [--url user@server.com:25565] [--password 12345] [script.js]";
}
