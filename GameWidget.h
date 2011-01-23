#ifndef GAMEWIDGET_H
#define GAMEWIDGET_H

#include <QGLWidget>

class GameWidget : public QGLWidget
{
    Q_OBJECT
public:
    explicit GameWidget(QWidget *parent = 0);

    void start(QString user, QString password, QString server);

protected:
    void paintGL();
    void resizeGL(int w, int h);
    void initializeGL();

};

#endif // GAMEWIDGET_H
