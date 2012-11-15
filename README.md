nexus-checker
=============
Periodically check the Google Play Store for 16GB Nexus 4, and send email when it's available.
The emails are sent using a GMail account (edit the source if you want to use a different email service).

## Requirements
* Node.js
* A hankering for a Nexus 4.

## Usage
```node nexus_checker.js```

Options:
```
  --user      Your GMail username, in the form username@gmail.com.   [required]
  --pass      Your GMail password.                                   [required]
  --to        Email addresses to notify (comma-separated list).      [required]
  --interval  Seconds to wait between checks. Default: 120 seconds.
```

Example:
```node nexus_checker.js --user mamacdon@gmail.com --pass mailPassword --to "mamacdon@gmail.com, friend@other.com"```
