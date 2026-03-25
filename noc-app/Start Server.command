#!/bin/bash

# Nemecek Org Clubs — Local Dev Server Launcher
# Double-click this file in Finder to start the local server and open the app.

cd "$(dirname "$0")"

# Check if Python 3 is available (it's built into macOS)
if ! command -v python3 &> /dev/null; then
  osascript -e 'display alert "Python 3 not found" message "Python 3 is required to run the local server. It should be built into your Mac — please contact Jeffrey for help." as critical'
  exit 1
fi

# Kill any existing server on port 8080
lsof -ti:8080 | xargs kill -9 2>/dev/null

# Start the server in the background
python3 -m http.server 8080 &
SERVER_PID=$!

# Wait a moment for server to start
sleep 1

# Open the app in the default browser
open "http://localhost:8080/index.html"

# Show a notification
osascript -e 'display notification "Local server running at localhost:8080" with title "NOC Dev Server" subtitle "Click Stop Server when done"'

# Keep the script alive and show a stop dialog
osascript -e 'display dialog "NOC Dev Server is running at localhost:8080

The app should have opened in your browser.

Click Stop Server when you are done." buttons {"Stop Server"} default button "Stop Server" with title "Nemecek Org Clubs — Dev Server"'

# Kill the server when dialog is dismissed
kill $SERVER_PID 2>/dev/null
lsof -ti:8080 | xargs kill -9 2>/dev/null

osascript -e 'display notification "Local server stopped." with title "NOC Dev Server"'
