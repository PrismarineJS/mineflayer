#include "MainWindow.h"
#include "ui_MainWindow.h"

#include "ConnectDialog.h"

MainWindow::MainWindow(QWidget *parent) :
    QMainWindow(parent),
    ui(new Ui::MainWindow)
{
    ui->setupUi(this);
    this->setCentralWidget(ui->gameWidget);
}

MainWindow::~MainWindow()
{
    delete ui;
}

void MainWindow::changeEvent(QEvent *e)
{
    QMainWindow::changeEvent(e);
    switch (e->type()) {
    case QEvent::LanguageChange:
        ui->retranslateUi(this);
        break;
    default:
        break;
    }
}

void MainWindow::start()
{
    this->show();


//    ConnectDialog dialog(this);
//    if (dialog.exec() == QDialog::Rejected) {
//        this->close();
//        return;
//    }

//    ui->gameWidget->start(dialog.username(), dialog.password(), dialog.server());

    ui->gameWidget->start("superbot", "", "localhost");

}
