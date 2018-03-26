# GroupMe Gallery Downloader
Download all of the photos in any group you have access to via the command line.

# What you'll need
* Git (optional)
* NodeJS
* GroupMe Developer ID
* GroupMe Chat ID

# Where to get your GroupMe Developer ID
* Go to https://dev.groupme.com/
* Login with your existing GroupMe credentials.
* Generate an access token -- This should be a 40(ish) character string.

# How to run this program (in terminal)
* `cd` to your desktop, or other directory of choice. 
* `git clone https://github.com/TylerK/groupme-gallery-downloader.git`
* `cd groupme-gallery-downloader`
* `npm install`
* `npm start`

You will be prompted for your GroupMe access token. 

> Note: This app **does not** store your token, or any other personal information.

Assuming all went well, you will now have a `photos_gallery` directory filling up with all of your photos (and videos, _I think_) from your channel's gallery. 

> Note: There is no "restart from where I left off" feature, so if it dies halfway through it will need to start from scratch. Apologies for my laziness, pull requests welcome. ;]
