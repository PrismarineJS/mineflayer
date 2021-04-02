FROM node:14

RUN apt-get update -y
RUN apt-get install -y xserver-xorg-dev libxi-dev xserver-xorg-dev libxext-dev xvfb

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install

COPY screenshot.js ./

RUN mkdir screenshots

# Start the container with the BrowserCubeMap example script
CMD xvfb-run --auto-servernum --server-num=1 --server-args='-ac -screen 0 1280x1024x24' node screenshot.js $HOST $PORT $USERNAME $PASSWORD
