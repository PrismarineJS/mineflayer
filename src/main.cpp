#include <QApplication>
#include <QStringList>
#include <QUrl>
#include <QDir>
#include <QFileInfo>

#ifdef MINEFLAYER_3D_ON
#include "MainWindow.h"
#endif

#include "MetaTypes.h"
#include "ScriptRunner.h"

#include <iostream>
#include <cstdlib>

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

    // set up lib path
    QStringList lib_path;
    lib_path << QDir::currentPath();

    QString env_path = QString::fromAscii(std::getenv("MINEFLAYER_LIB"));
    if (! env_path.isNull()) {
        lib_path << env_path.split(":");
    }

    QStringList args = a.arguments();
    for (int i = 1; i < args.size(); i++) {
        QString arg = args.at(i);
        if (arg == "--debug") {
            script_debug = true;
        } else if (arg == "--3d") {
            headless = false;
        } else if (arg.startsWith("-I")) {
            lib_path.append(arg.mid(2));
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
    lib_path.prepend(QFileInfo(script_filename).dir().absolutePath());
    if (env_path.isNull()) {
       // default lib path
       lib_path << "/usr/lib/mineflayer"; // linux
       lib_path << a.applicationDirPath() + "/lib"; // windows
   }

    url.setPassword(password);

    MetaTypes::registerMetaTypes();

#ifndef MINEFLAYER_3D_ON
    if (! headless)
        qWarning() << "3D support was not compiled in. You can only use headless mode.";
#endif

    if (! script_filename.isEmpty()) {
        ScriptRunner runner(url, script_filename, script_debug, headless, lib_path);
        runner.go();
        if (headless)
            return a.exec();
    }

#ifdef MINEFLAYER_3D_ON
    MainWindow w(url);
    return w.exec();
#else
    printUsage(args.at(0));
    return 1;
#endif
}

void printUsage(QString app_name)
{
#ifdef MINEFLAYER_3D_ON
    QString headless_text = "[--3d] ";
#else
    QString headless_text = "";
#endif
    std::cout << "Usage: " << app_name.toStdString() << " [--debug] " <<
        headless_text.toStdString() << "[--url user@server.com:25565] [--password 12345] [-I<path/to/libs>] [script.js]"
        << std::endl;
}
