#!/bin/sh -e
# lets check if we have the submodules initialized

DIR=`dirname $0`

case `uname -a` in
Linux*x86_64*)  echo "Linux 64 bit"   
    "$DIR/../support/node-builds/lin64/node" "$DIR/cocos.js" "$@" 
	;;

Linux*i686*)  echo "Linux 32 bit"   
	"$DIR/../support/node-builds/lin32/node" "$DIR/cocos.js" "$@"
	;;
    
Darwin*)  echo  "OSX"
    "$DIR/../support/node-builds/osx64/node" "$DIR/cocos.js" "$@"
    ;;

CYGWIN*)  echo  "Cygwin"
    "$DIR/../support/node-builds/win32/node.exe" "$DIR/cocos.js" "$@"
    ;;

MING*)  echo  "MingW"
    "$DIR/../support/node-builds/win32/node.exe" "$DIR/cocos.js" "$@"
    ;;    

*) echo "Unknown OS"
   ;;
esac



