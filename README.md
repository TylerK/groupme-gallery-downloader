# GroupMe Gallery Downloader
Download all of the photos in any group you have access to via the command line.

## What you'll need
* An environment capable of running [Node](https://nodejs.org)
* Git installed locally
* Your GroupMe access token

## Where to get your access token
* Go to https://dev.groupme.com/
* Login with your existing GroupMe credentials.
* Click "Access Token" 
* Copy your token to your clipboard

## How to run this program

In terminal or your editor of choice, run the following: 

* `cd` to your desired location. 
* `git clone https://github.com/TylerK/groupme-gallery-downloader.git`
* `cd groupme-gallery-downloader`
* `yarn && yarn start` - or - `npm i && npm start` 

You will be prompted for your GroupMe access token. Go ahead and paste it in and press enter. Assuming all went well, you will now be able to select a group you have access to. Select a group and you should see a stream of photos filling up a newly created `photos` folder. 

NOTE: Your access token is stored locally in the `data` folder so you can re-use it later. This folder is ignored by Git, but please do not make it publically available in any way shape or form.  

## Restarting 

Simply run `yarn start` or `npm start` and select the group you were downloading from, the downloader will pick up where you left off :)
