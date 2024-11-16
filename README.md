## Storing file bytes into a png image.

A fun project where I try to play with bytes and understand binary data, to hide data inside of png files.

Using js library [UPNG's Github](https://github.com/photopea/UPNG.js)
also Using pako [pako's Github](https://github.com/nodeca/pako)
I used these libraries to hundle png reading and writing, I only inpute and change image uncompressed raw bytes and these libraries can hundle compressing and decompressing from png to raw image bytes.

the script stores the file extension string and the bytelength also the files bytes as image raw data, so that it can read the data and write the file from it, it uses an 800x600px and fills it with an x amount of data till it's full.
