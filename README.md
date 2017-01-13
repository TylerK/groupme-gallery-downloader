# GroupMe Gallery Downloader
Download all of the photos in any group you have access to via the command line.

# What you'll need
* Git (optional)
* NodeJS
* GroupMe Developer ID
* GroupMe Chat ID

# Where to get a GroupMe Developer ID
* Go to https://dev.groupme.com/
* Login with your existing GroupMe credentials.
* Generate an access token -- This should be a 40 character string.
* Keep this handy, you'll need it later.

# Where to get a chat ID
* Once you have your access token, go to https://api.groupme.com/v3/groups?token=PUT_YOUR_TOKEN_HERE
* You should see a JSON response that includes all of your groups.
* Find the correct group.
* Keep the `group_id` value handy, you'll need it later.

# How to run this program (in terminal)
* `git clone`
* `npm install`
* `npm start`

You will be prompted for your GroupMe developer token – _This is only used to make the initial requests_ – and a GroupMe chat ID number.

Assuming all went well, you will now have a `photos_gallery` directory semi-rapidly filling up with all of your photos and videos from your channel's gallery. 

_Note:_ So as not to be completly mean to GroupMe's poor beleaguered servers, this will download a single image at a time. Apologies for this taking a bit.
