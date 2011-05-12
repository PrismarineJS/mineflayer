#ifdef MINEFLAYER_GUI_ON
#include <QApplication>
#else
#include <QCoreApplication>
#endif

#include <QStringList>
#include <QUrl>
#include <QDir>
#include <QFileInfo>
#include <QDebug>

#include "ScriptRunner.h"
#include "MetaTypes.h"

#include <iostream>
#include <cstdlib>

void printUsage(QString app_name);

int main(int argc, char *argv[])
{
#ifdef MINEFLAYER_GUI_ON
    QApplication a(argc, argv);
#else
    QCoreApplication a(argc, argv);
#endif

    // parse arguments
    bool script_debug = false;
    QString script_filename;
    QStringList script_args;
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
            script_filename = arg;
            // all the rest of the args get exposed to the script api
            script_args.append(args.mid(i + 1));
            break;
        }
    }

    lib_path.prepend(QFileInfo(script_filename).dir().absolutePath());
    if (env_path.isNull()) {
       // default lib path
       lib_path << "/usr/lib/mineflayer"; // linux
       lib_path << a.applicationDirPath() + "/lib"; // windows
   }

    url.setPassword(password);

#ifndef MINEFLAYER_GUI_ON
    if (script_debug) {
        qWarning() << "Gui support was not compiled in. You cannot use the debugger.";
        script_debug = false;
    }
#endif

    MetaTypes::registerMetaTypes();
    if (! script_filename.isEmpty()) {
        ScriptRunner runner(url, script_filename, script_args, script_debug, lib_path);
        runner.bootstrap();
        return a.exec();
    }

    printUsage(args.at(0));
    return 1;
}

void printUsage(QString app_name)
{
#ifdef MINEFLAYER_GUI_ON
    QString debug_text = "[--debug] ";
#else
    QString debug_text = "";
#endif
    std::cout << "Usage: " << app_name.toStdString() << " " << debug_text.toStdString()
        << "[--url user@server.com:25565] [--password 12345] [-I<path/to/libs>] script.js [script_args...]"
        << std::endl;
}
