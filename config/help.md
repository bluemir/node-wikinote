# WikiNote Configuration Guide

## Comand Line Options

```
Usage : wikinote.js [options]

Options:
  -h, --help              Show help                                    [boolean]
  --wikinote-path         wikinote data path        [string] [default: "~/wiki"]
  -c, --config-file       config file path
                          [string] [default: "<wikinote-path>/.app/config.yaml"]
  -p, --port              port number                   [number] [default: 3000]
  -n, --name, --wikiname  wikinote name           [string] [default: "WikiNote"]
  -f, --front-page        set front page name   [string] [default: "front-page"]
  -b, --auto-backup       auto backup with git         [boolean] [default: true]
  --save                  save option to file                          [boolean]
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

