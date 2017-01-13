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
* Generate an access token -- This should be a 40 character string.
* Keep this handy, you'll need it later.

# Where to get your chat ID
* Once you have your access token, go to https://api.groupme.com/v3/groups?token=PUT_YOUR_TOKEN_HERE
* You should see a JSON response that includes all of your groups.
* Find the correct group.
* Keep the `group_id` value handy, you'll need it later.

# How to run this program (in terminal)
* `cd` to your desktop, or other directory of choice. 
* `git clone https://github.com/TylerK/groupme-gallery-downloader.git`
* `cd groupme-gallery-downloader`
* `npm install`
* `npm start`

You will be prompted for your GroupMe access token and a chat ID number. 

> Note: This program does not store your ID's.

Assuming all went well, you will now have a `photos_gallery` directory filling up with all of your photos (and videos, _I think_) from your channel's gallery. 

Unfortunately due to limitations on GroupMe's end, this is unable to retain the original file names and folders. So this will output a flat directory of similarly named files.

This means renaming and sorting them will need to be a manual process.

> Note: There is no "restart from where I left off" feature, so if it dies halfway through it will need to start from scratch. Apologies for my laziness, pull requests welcome. ;]
