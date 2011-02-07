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
    QString script_filename;
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
                qWarning() << "Need url parameter after --url option.";
                printUsage(args.at(0));
                return -1;
            }
            QUrl new_url = QUrl::fromUserInput(args.at(++i));
            if (new_url.userName().isEmpty())
                new_url.setUserName(url.userName());
            if (new_url.host().isEmpty())
                new_url.setHost(url.host());
            new_url.setPort(new_url.port(url.port()));
            if (! new_url.password().isEmpty())
                password = new_url.password();
            url = new_url;
        } else if (arg == "--password") {
            if (i+1 >= args.size()) {
                qWarning() << "Need password parameter after --password option.";
                printUsage(args.at(0));
                return -1;
            }
            password = args.at(++i);
        } else if (arg.startsWith("--")) {
            qWarning() << "Unrecognized option: " << arg;
            printUsage(args.at(0));
            return -1;
        } else {
            if (script_filename.isEmpty()) {
                script_filename = arg;
            } else {
                qWarning() << "Don't know what to do with 2 input files.";
                printUsage(args.at(0));
                return -1;
            }
        }
    }
    url.setPassword(password);

    MetaTypes::registerMetaTypes();

    if (! script_filename.isEmpty()) {
        ScriptRunner runner(url, script_filename, script_debug, headless);
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
