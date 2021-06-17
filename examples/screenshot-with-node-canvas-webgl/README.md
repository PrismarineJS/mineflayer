### node-canvas-webgl example

#### screenshot.js
Generates Screenshots of the bot world

### Starting

Linux:

`
xvfb-run -s "-ac -screen 0 1280x1024x24" node <your script> [...args]
`

Mac High Sierra:

`node <your script> [...args]`

### Installation:
Installation on a none unix based systems is none trivial. 
I suggest you install it on something like Ubuntu. Or a Virtual Machine running Ubuntu.
Mac OS X may work too, but I have only tested it on 10.13 High Sierra.

Do `npm install` to install all required node packages.

#### Troubleshooting (Linux):
If npm fails while installing try installing the following and try again:
```bash
sudo apt-get update -y
sudo apt-get install -y xserver-xorg-dev libxi-dev xserver-xorg-dev libxext-dev xvfb
```

### Docker
If you want to run the screenshot example on windows without a vm you can install it in a Docker Container.

Building the Docker image:
```bash
cd screenshot-with-node-canvas
docker build . -t screenshot-bot
```

Running the image and saving the screenshot to the current directory:
```bash
docker run -v $(pwd):/usr/src/app/screenshots -e HOST='<server ip address>' -e PORT=<port> screenshot-bot
```
`-e USERNAME=User1` and `-e PASSWORD=<Your password>` can be added if the server is not running in offline mode.


