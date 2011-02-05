#!/bin/sh -e
# lets check if we have the submodules initialized

case `uname -a` in
Linux*x86_64*)  echo "Linux 64 bit"   
	support/node-builds/lin64/node bin/cocos.js "$@" 
	;;

Linux*i686*)  echo "Linux 32 bit"   
	support/node-builds/lin32/node bin/cocos.js "$@"
	;;
    
Darwin*)  echo  "OSX"
    support/node-builds/osx64/node bin/cocos.js "$@"
    ;;

CYGWIN*)  echo  "Cygwin"
    support/node-builds/win32/node.exe bin/cocos.js "$@"
    ;;

MING*)  echo  "MingW"
    support/node-builds/win32/node.exe bin/cocos.js "$@"
    ;;    

*) echo "Unknown OS"
   ;;
esac



