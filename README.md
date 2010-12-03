Check the LICENSE file licensing details.

This is in the very early stages of development and should be considered
experimental.

Contact Me
----------

My name is Ryan Williams.

* You can find me on Twitter: @Raticide and @cocos2djs
* Email me at: <cocos2d@ryanwilliams.org>
* My website is: <http://ryanwilliams.org/>

Example Code
------------

If you want a very basic example and a good starting point then you should checkout
<https://github.com/RyanWilliams/cocos2d-helloworld>

Getting things running
----------------------

To get things up and running simply run the server.py Python script:

    $ ./server.py

And visit <http://localhost:4000/>. You will see a selection of tests you can run.

Developing
----------

Everything you write will be in JavaScript. The two Python scripts (make.py and
server.py) are to build and serve your code during development. It would be
very unwise to use the server.py script in production.

The entry point for the code is path defined as "main.js" inside the in "make.js" file.

In the public/index.html you will see &lt;script src="cocos2d.js"&gt; tag to include the code.

The server uses the make.py script to compile your code each time it is
requested. This makes development a lot easier.

Run ./server.py -h for help.

More documentation is coming when the framework is in a more usable state.

Compiling your app
------------------

To compile your code you run the make.py script. Which reads the make.js file
to work out what you want to build.

When built the resulting .js file will contain all your code aswell as all your
images and map files. This means you only need to update a single file and only
a single HTTP request is needed to serve everything.

Run ./make.py -h for help.

Browser Support
---------------

I intend for this to work in Firefox, Chrome, Safari, Opera and IE9. I
mostly develop using Chrome so that's likely to have the best compatibility
until I get close to an alpha quality build.

Documentation
-------------

Download JsDoc 2.3 (or 2.4) from <http://code.google.com/p/jsdoc-toolkit/>.

Copy that to /usr/local/jsdoc-toolkit or wherever you like and then run:
    
    java -jar /usr/local/jsdoc-toolkit/jsrun.jar /usr/local/jsdoc-toolkit/app/run.js -t=/usr/local/jsdoc-toolkit/templates/jsdoc -d=./jsdocs/ -r 10 src/

The documentation will appear in the jsdocs directory.

© 2010 Ryan Williams <cocos2d@ryanwilliams.org>

