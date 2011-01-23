#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>

namespace Ui {
    class MainWindow;
}

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    explicit MainWindow(QWidget *parent = 0);
    ~MainWindow();

    void start();

protected:
    void changeEvent(QEvent *e);

private:
    Ui::MainWindow *ui;

    QString m_user, m_password, m_server;
};

#endif // MAINWINDOW_H
