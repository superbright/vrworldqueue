#!/bin/bash
NOW=$(date +"%m-%d-%Y")
FILE="backup.$NOW.tar.gz"
echo "Backing up data to ./dbbackups/$NOW, please wait..."
mongodump --db vrworld --out ./dbbackups/$NOW