@echo off

echo starting server
wt -w 0 new-tab -d .\server cmd /k "npm run dev" 

echo starting client
wt -w 0 new-tab -d .\client cmd /k "npm run dev"

echo your git status 
cmd /k "git status"