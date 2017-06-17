# sinkless
A sync-less (more or less) password manager.  With emojis! 👍

Works as an extension in recent chrome and firefox.  Works as a website in recent chrome and firefox.

* As a [website](https://kybernetikos.github.io/sinkless)
* As a [chrome plugin](https://github.com/kybernetikos/sinkless/raw/master/dist/sinkless.crx)
* As a [firefox plugin](https://github.com/kybernetikos/sinkless/raw/master/dist/sinkless-1.0-an%2Bfx.xpi)

When you need a password, open sinkless, make sure the purpose is right, then enter your master password.

Underneath you'll see the generated password based on your settings for that purpose combined with your master
password.  Clicking on it or pressing enter should copy it to your clipboard.  If you are using the browser extensions, hitting
shift-enter should automatically try to enter it into whatever input you were in when you triggered
sinkless.

Hotkeys
-------

To set a hotkey to open sinkless in chrome, go to More Tools -> Extensions, scroll to the bottom and choose 'Keyboard shortcuts'.  

I use Command+Shift+P on Mac.  In firefox the extension should get that hotkey unless you have something
else using it.

Settings
--------

Here's an example of a site with the default settings

    Purpose                 | Version | Salt | Length | Alphabet
    ------------------------|---------|------|--------|----------------------------------------------------------------------------
    https://www.reddit.com  |     0   | salt |     40 | abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-%$#.!@^&*()

With these settings and a master password of 'masterpass', the generated password should be `bDYUBoEk-Fr8L6P)MES3#$NM2RsPI%#5rTKc^#yy`

* The purpose can be any string, but is by default set to the origin of the site, including the protocol (to
 ensure that the same password is not used for an https and an http site).
* The version is a variable that you can increment if you need to change the password for some reason.
* The salt allows you to set extra public information to include in the password generation for each site.
  To be a proper salt, it should be random.  I am not currently using this personally, and leave it set to 'salt', but
  that means it's not doing any good either... You could use it to have different generated passwords for different
  usernames on the same site.
* The length is the number of characters in the generated password
* The alphabet should be the characters that are allowed in the password

If some purpose doesn't use the defaults, you can edit the settings.  These settings are not secret and can be exported
(copy and paste to email?) and imported and recorded simply.  They are stored in localstorage in the browser too so you
don't have to enter them each time.  You should make sure to keep a copy of the settings for any site that doesn't use
the defaults.  Clicking 'Show All' gives you the list of settings in a way that you can copy and gives you access to the
import button.

At the moment, the alphabet is always reordered to be [a-z] then [A-Z] then [0-9] then everything else.  If you enter
the wrong classes into the wrong alphabet settings area, you'll probably get very confused
because they'll be reordered.

How the password is generated
-----------------------------

The key derivation uses the subtle crypto built into recent browsers.

```js
async function pbkdf(keyStr, saltStr, iterations, keyLen, digestAlgo = "SHA-512") {
	const key = await window.crypto.subtle.importKey(
		'raw',
		new TextEncoder("utf-8").encode(keyStr),
		{name: 'PBKDF2'},
		false,
		['deriveBits']
	)
	return await window.crypto.subtle.deriveBits({
			"name": "PBKDF2",
			salt: new TextEncoder("utf-8").encode(saltStr),
			iterations,
			hash: {name: digestAlgo}
		},
		key,
		keyLen * 8
	)
}
```

You can generate the same derived password in node using this code:

```js
const crypto = require('crypto')

function pbkdf(keyStr, saltStr, iterations, keyLen, digestAlgo = "SHA-512") {
	return new Promise( (resolve, reject) => {
		crypto.pbkdf2(keyStr, saltStr, iterations, keyLen, digestAlgo.replace(/-/g, '').toLowerCase(), (err, key) => {
			if (err) {
				reject(err)
			} else {
				resolve(key)
			}
		})
	})
}

async function generatePass(masterPassword, salt, version = 0, len = 40, alphabet, purpose) {
	const buffer = await pbkdf(purpose + version + masterPassword, salt, 800000, len, "SHA-512")
	return Array.from(new Uint8Array(buffer)).map((x) => alphabet.charAt(Math.floor((x / 256) * alphabet.length))).join("")
}
```

Have a look at `genpass.js` if you're interested in generating passwords in node.

You can see that it's deriving the bits using PBKDF2. The key is built from `purpose+version+masterPassword`.
The number of iterations is set to `800000` and the digest algorithm is SHA512.  This *will* be slow on constrained
devices, which should reduce the risk of brute force attacks on your master password.

Emojis
------

The emojis are intended to give you an at-a-glance indication of whether you've got everything right before you try to
log in.  The first emoji is a person representing the settings you're currently using including the purpose and the
version.  The second emoji is an action representing your master password.  If you use the same master password
everytime, it will always be the same.  The third emoji represents everything combined together - i.e. the generated
password.  If you are trying to log into your bank account and the emojis are not the same as normal then you know you
have either entered your password wrong or you need to tweak your settings.

Todo
----

* Improve the UI
   * make it nicer
   * make it responsive so it looks good on mobile
   * remove the gotchas around alphabet settings
* Make it work as a nice offline app on mobile

More crazy:

* A mobile version that can pretend to be a bluetooth keyboard that can generate and enter passwords into other devices.
* Some WebRTC to sync settings or send generated passwords to the plugin to get them entered with the master password
  living on a different device.