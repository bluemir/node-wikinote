# WikiNote Configuration File Guide

WikiNote는 commnad line과 Config File 둘다 사용이 가능합니다.
다만 command line의 arguments는 일부 제한될수도 있습니다.
command line 옵션의 설명을 보려면 -h 옵션을 사용하세요.

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
  - name : disqus
    shortname : <short name>
```

## Plugin 설정

Plugin의 이름은 두가지 방법으로 지정할수 있습니다.
1. 이름 바로 넣기
	* plugin에 다른 config정보를 전달하지 못합니다.
2. 객체의 name 에 지정하기
	* plugin에 지정된 객체를 넘겨주므로 추가적인 설정이 가능합니다.

Plugin은 다음과 같은 규칙으로 모듈을 찾습니다.

* 이름을 npm package search 방법으로 검색
* 이름에 "wikinote-"라는 prefix를 붙여 npm package search 방법으로 검색
* <wikitnote data dir>/.app/plugins 에서 이름으로 검색
* 소스 폴더의 plugins에서 이름으로 검색(기본 플러그인)

### 기본 plugins

wikinote 에서는 기본적으로 3개의 plugin을 제공합니다.

* comment
	* 심플한 comment를 달수 있으며 recaptcha를 사용해서 bot을 막을수 있습니다.
	* private key 와 public key를 지정해야 합니다.
* disqus
	* disqus를 별도의 코드 없이 바로 붙일수 있습니다.
	* shortname을 옵션으로 지정해야 합니다.
* remark
	* remark를 presentation 용으로 사용합니다.
* presentation
	* deprecated
