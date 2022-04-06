#!/bin/bash
#[NOM:k1GetQueryLite.cgi][INFO:Ejecuta la sentencia SQL en SQLite3]


  id=$1
  bd=$2
path=$3
stmt=$4

#echo "$3/$2"
ahora=$(date +%Y%m%d-%H%M%S)
echo "[id0:$id][hora:$ahora][cgi:$0][fich:$bd]" >> $path/trazas

temp="$path/temp"
echo ".headers ON" > "$temp/stmt_$id.sql"
echo $stmt > "$temp/base64_$id.txt"

Comun/cgibin/base64.sh -a decode -f "$temp/base64_$id.txt" >> "$temp/stmt_$id.sql"
cat "$temp/stmt_$id.sql" | sqlite3 "$path/$bd"

mv "$temp/stmt_$id.sql" "$temp/stmt.sql"
rm "$temp/base64_$id.txt"

echo "[error:$?]"

