# Using mineflayer in Python

* Checkout the tutorial on Google Colab 👉 [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/PrismarineJS/mineflayer/blob/master/docs/mineflayer.ipynb)

Thanks to [JSPyBridge](https://github.com/extremeheat/JSPyBridge), it is possible to use mineflayer in python!


### Install

Make sure you have Python 3.8 or newer installed and also Node.js 14 or newer. You can get them from https://www.python.org/downloads/ and https://nodejs.org/.

You can access mineflayer in Python in addition to any other JavaScript package by first installing the javascript pip package:

```sh
pip install javascript
```


Once you have the package installed, you can put this at the top of your Python:

```py
from javascript import require
mineflayer = require('mineflayer')
```

... and you're good to go, with full API access. You interact with the API very similarly to JavaScript. 

### Examples

* [gps](https://github.com/PrismarineJS/mineflayer/blob/master/examples/python/basic.py) (based on [js version](https://github.com/PrismarineJS/mineflayer/blob/master/examples/pathfinder/gps.js))
* [chatterbot](https://github.com/PrismarineJS/mineflayer/blob/master/examples/python/chatterbox.py)  (based on [js version](https://github.com/PrismarineJS/mineflayer/blob/py/examples/chatterbox.js))

### See also
* [javascript pip package docs](https://github.com/extremeheat/JSPyBridge/blob/master/docs/python.md)
