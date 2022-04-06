#!/bin/bash
# *****************************************************************
# file: base64.sh
# date: 2007-11-01 13:00
# author: Marko Schulz - <info@tuxnet24.de>
# description: convert string whith base64.
# *****************************************************************
#
# 
# SYNOPSIS
#
# This program action encode a logo.png (binary) to STDOUT (in this case to logo64.txt)
# tux@earth:~$ ./base64.sh -a encode -f ./logo.png > logo64.txt
#
# This program action decode a logo64.txt (ASCII) to STDOUT (in this case to logo.png)
# tux@earth:~$ ./base64.sh -a decode -f ./logo64.txt > logo.png
#
#
# *****************************************************************
# This function display error and usage and end this program...
function f_alert() {
local error=$1
echo -e "\n$( basename $0): convert string whith base64\n"
[ -n "$error" ] && echo -e "\a${error}\n"
echo -e "Usage: $( basename $0 ) -a {encode|decode} -f </PATH/TO/FILE> [ -h ]\n"
echo -e "\t-a the action for ecode or decode"
echo -e "\t-f path to fie name"
echo -e "\t-h display this screen\n"
exit 1

}

# *****************************************************************

# get the cmd arguments...

while getopts f:a:h Optionen 2>/dev/null; do

    case $Optionen in
  f) pFile=$OPTARG  ;;
  a) pAction=$OPTARG ;;
  h) f_alert ;;
  *) f_alert "ERROR: Invalid argument" ;;
    esac
done

# *****************************************************************
# program action...
# error if no file defined...

[ ! -f "$pFile" ] && f_alert "ERROR: No input file defined"

case "$pAction" in

	encode)
		perl -MMIME::Base64 -0777 -ne 'print encode_base64($_)' < $pFile
	;;
	decode)
		perl -MMIME::Base64 -0777 -ne 'print decode_base64($_)' < $pFile
	;;
	*)
		f_alert "ERROR: Invalid argument for action"
	;;
esac


# *****************************************************************
# EOF


