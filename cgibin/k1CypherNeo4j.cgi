#!/bin/bash
#[NOM:k1GetQueryLite.cgi][INFO:Ejecuta la sentencia stmt en Neo4j]


  id=$1
 usr=$2
 pwd=$3
stmt=$4
path=$5

#echo "-u $usr -p $pwd"
ahora=$(date +%Y%m%d-%H%M%S)
echo "[id0:$id][hora:$ahora][cgi:$0][fich:$usr]" >> $path/trazas

temp="$path/temp"
echo $stmt > "$temp/base64_$id.txt"

Comun/cgibin/base64.sh -a decode -f "$temp/base64_$id.txt" > "$temp/stmt_$id.cypher"
cat "$temp/stmt_$id.cypher" \
  | cypher-shell  -u $usr -p $pwd --format verbose \
  | grep -v "+-----"

mv "$temp/stmt_$id.cypher" "$temp/stmt.cypher"
#rm "$temp/base64_$id.txt"

echo "[error:$?]"

