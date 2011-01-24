#ifndef CONNECTIONSETTINGS_H
#define CONNECTIONSETTINGS_H

#include <QString>

class QSettings;

class ConnectionSettings
{
public:
    QString hostname;
    int port;
    QString username;
    QString password; // empty string means no saved password

    ConnectionSettings();

    static ConnectionSettings * loadSettings(QSettings * settings, QString prefix);
    void saveSettings(QSettings * settings, QString prefix);

};

#endif // CONNECTIONSETTINGS_H
