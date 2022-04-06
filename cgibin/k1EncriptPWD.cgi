#!/bin/bash
#[NOM:k1EncriptPWD.cgi][INFO:Concatena user y password, y devuelve el MD5]

  id=$1
 usr=$2
 pwd=$3
ruta=$4

#echo $1 $2 $3 $4
ahora=$(date +%Y%m%d-%H%M%S)
echo "[id0:$id][hora:$ahora][cgi:$0][user:$2]" >> $ruta/trazas
tira=$(echo $2.$3 | md5sum)
echo $tira

