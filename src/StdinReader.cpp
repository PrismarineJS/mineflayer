#include "StdinReader.h"

#include <QCoreApplication>
#include <QDebug>

StdinReader::StdinReader() :
        QThread(NULL),
        m_stdin(stdin)
{
    // run our 1 slot in the main thread
    this->moveToThread(QCoreApplication::instance()->thread());
}

void StdinReader::cleanup()
{
    // abruptly terminate the stdin reading
    this->terminate();
}

void StdinReader::run()
{
    // now that we've started, attach a cleanup handler
    bool success;
    success = connect(QCoreApplication::instance(), SIGNAL(aboutToQuit()), this, SLOT(cleanup()));
    Q_ASSERT(success);

    forever {
        QString line = m_stdin.readLine();

        if (line.isNull()) {
            emit eof();
            break;
        }
        emit readLine(line);
    }
}
