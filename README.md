# Autocrypt demo socket server

simple socket.io server to simulate a mail server for autocrypt demo

## install
- clone the repo and get into it 
- ```npm i```

## start
- ```npm run start``` runs the server
- ```npm run watch``` enable debug statement and reload the server when it is modified
- ```npm run clean``` clean the message stored in the 'msgs' dir

## use

a basic client is available the server gives the link once started
you have to send a username to send messages
this client is here to test the server, and will be merged with the current ui

## to do
- implement replication of message to the recipent
- write tests
- merge with current ui
- stats
