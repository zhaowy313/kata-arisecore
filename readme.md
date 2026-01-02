# kata-arisecore

`kata-arisecore` is a hybrid Go game project combining Next.js and Expo, built on top of the WGo.js library.

## Project Structure

- `/web`: Next.js web application (WGo.js WebView host)
- `/mobile`: Expo mobile application (React Native WebView client)
- `/core`: The core WGo.js game engine logic

WGo is written in javascript with help of HTML5 and WGo applications should work fine in all new browsers, even on Androids and iPhones.
Unfortunately it won't work on Internet Explorer 8 and lower, because of absence of canvas element, which is crucial for drawing of a board.

WGo.js also comes with powerfull go player, or more precisely sgf game viewer, which can be embedded into websites. This player is designed to be unlimitedly extendable.

WGo.js contains two main modules Board and Game.

### Board

Graphical go board implemented in HTML5 canvas. It has extensive API for easy manipulation. You can add and remove predefined objects like stones on board, you can create your own objects, or even make cut-outs of board.

### Game

Object for storing of game's position and controling game's flow. With method "play" you can play move and create new position with rules applied.

## WGo.js Player

It is web viewer of Go games (SGF) built on top of the WGo.js library. You can easily put it into your website.
