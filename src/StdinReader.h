#ifndef STDINREADER_H
#define STDINREADER_H

#include <QObject>
#include <QTextStream>
#include <QThread>

class StdinReader : public QThread
{
    Q_OBJECT
public:
    StdinReader();

signals:
    void eof();
    void readLine(QString line);

private:
    QTextStream m_stdin;

private slots:
    void cleanup();

protected:
    virtual void run();
};

#endif // STDINREADER_H
