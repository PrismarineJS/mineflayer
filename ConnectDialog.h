#ifndef CONNECTDIALOG_H
#define CONNECTDIALOG_H

#include <QDialog>

namespace Ui {
    class ConnectDialog;
}

class ConnectDialog : public QDialog
{
    Q_OBJECT

public:
    explicit ConnectDialog(QWidget *parent = 0);
    ~ConnectDialog();

    QString username() const;
    QString password() const;
    bool rememberLogin() const;
    QString server() const;

protected:
    void changeEvent(QEvent *e);

private:
    Ui::ConnectDialog *ui;

};

#endif // CONNECTDIALOG_H
