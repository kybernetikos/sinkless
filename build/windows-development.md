Building for Firefox
--------------------

Install web-ext

```cmd
npm install --global web-ext
```

Run from the sinkless folder (configuration points at firefox nightly)

```cmd
web-ext run
```

Build and sign a new release (you'll have to update the version in the manifest.json)

```cmd
web-ext sign --api-key=%ISSUER% --api-secret=%SECRET%
```
