# GroupMe Gallery Downloader
Download all of the photos in any group you have access to via the command line.

# What you need
Git and NodeJS installed, and some basic terminal knowledge. 

# How to
* Clone this repository (preferaby to your desktop)
* `npm install`
* `npm start`

You will be prompted for your GroupMe developer token – _This is only used to make the initial requests_ – and a GroupMe chat ID number.

Assuming all went well, you will now have a `photos_gallery` directory semi-rapidly filling up with all of your photos and videos from your channel's gallery. 

_Note:_ So as not to be completly mean to GroupMe's poor beleaguered servers, this will download a single image at a time. Apologies for this taking a bit.
