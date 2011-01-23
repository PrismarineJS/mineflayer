#include "ConnectionSettings.h"

#include <QSettings>

ConnectionSettings::ConnectionSettings() :
    host(),
    port(0),
    username(),
    password("")
{}

ConnectionSettings * ConnectionSettings::loadSettings(QSettings *settings, QString prefix)
{
    ConnectionSettings * cs = new ConnectionSettings();
    cs->host = settings->value(prefix + "host", cs->host).toString();
    cs->port = settings->value(prefix + "port", cs->port).toInt();
    cs->username = settings->value(prefix + "username", cs->username).toString();
    cs->password = settings->value(prefix + "password", cs->password).toString();
    return cs;
}

void ConnectionSettings::saveSettings(QSettings *settings, QString prefix)
{
    settings->setValue(prefix + "host", host);
    settings->setValue(prefix + "port", port);
    settings->setValue(prefix + "username", username);
    settings->setValue(prefix + "password", password);
}
