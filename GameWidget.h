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
    void mouseMoveEvent(QMouseEvent *);
    void mousePressEvent(QMouseEvent *);
    void mouseReleaseEvent(QMouseEvent *);

};

#endif // GAMEWIDGET_H
