#include "ConnectDialog.h"
#include "ui_ConnectDialog.h"
#include "MainWindow.h"

ConnectDialog::ConnectDialog(QWidget *parent) :
    QDialog(parent),
    ui(new Ui::ConnectDialog)
{
    ui->setupUi(this);
}

ConnectDialog::~ConnectDialog()
{
    delete ui;
}

void ConnectDialog::changeEvent(QEvent *e)
{
    QDialog::changeEvent(e);
    switch (e->type()) {
    case QEvent::LanguageChange:
        ui->retranslateUi(this);
        break;
    default:
        break;
    }
}

QString ConnectDialog::username() const
{
    return ui->textUsername->text();
}

QString ConnectDialog::password() const
{
    return ui->textPassword->text();
}

bool ConnectDialog::rememberLogin() const
{
    return ui->checkRemember->isChecked();
}

QString ConnectDialog::server() const
{
    return ui->textServer->text();
}
