# WikiNote Configuration Guide

## Comand Line Options

```
Usage : wikinote.js [options]

Options:
  -h, --help              Show help                                    [boolean]
  --wikinote-path          Location of wikinote data
                                                    [string] [default: "~/wiki"]
  -c, --config-file       Location of config file
                          [string] [default: "<wikinote-path>/.app/config.yaml"]
  -p, --port              Port number                            [default: 3000]
  -n, --name, --wikiname  Set WikiNote name       [string] [default: "WikiNote"]
  -f, --front-page        Front page name & url [string] [default: "front-page"]
  -b, --auto-backup       Automatic backup with git    [boolean] [default: true]
  --save                  Save option to config file                   [boolean]

```

## Config File Example

```
port : 4000
frontPage : "front-page"
autoBackup : false
security :
    salt : 123456789
    defaultPermissions :
        - read
        - write
wikiname : WikiNote
plugins :
	- remark

```

