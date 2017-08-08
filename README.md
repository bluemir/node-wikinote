# [Deprecated] node-Wikinote

This project will no longer be maintained or supported.
Please do not file issues or pull-requests against this repo.
you can use [go version](https://github.com/bluemir/node-wikinote)


wiki-like contents manager system using markdown syntax

[![Join the chat at https://gitter.im/bluemir/wikinote](https://badges.gitter.im/bluemir/wikinote.svg)](https://gitter.im/bluemir/wikinote?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![GitHub tag](https://img.shields.io/github/tag/bluemir/wikinote.svg)](https://github.com/bluemir/wikinote)
[![GitHub license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/bluemir/wikinote/blob/master/LICENSE)
[![Sample](https://img.shields.io/badge/Demo-WikiNote-049aff.svg)](http://wikinote.bluemir.me/wikinote)

[English](#en), [한국어](#ko)

<a name="en"></a>

## Feature
* simple text formatting syntax using [markdown](http://daringfireball.net/projects/markdown)
* real-time Collaborative editing
* not using db, just using file system(edit with general text editor)
* history management using "git"
* authentication & authorization
* easy to install & backup (just copy directory)

## Install & Run

```
# using docker
docker run -d -p <port>:4000 -v <data directory>:/wikinote/data bluemir/wikinote


# using npm (require nodejs v4.x)
npm install -g wikinote
wikinote


# from source (require nodejs v4.x)
git clone https://github.com/bluemir/wikinote.git
cd wikinote
npm install
node wikinote.js
```

## Syntax
WikiNote use [marked](https://github.com/chjj/marked) as markdown parser and renderer.
It also render [GFM(Github Flavored Markdown)](https://help.github.com/articles/github-flavored-markdown).
There are good document for those syntax and listing blow.

* [Basic Markdown](http://daringfireball.net/projects/markdown/)
* [GFM](https://help.github.com/articles/github-flavored-markdown)

## Plug-in
Plug-ins are available in WikiNote which can make easily. If you want more plug-in, you can make them.
For now, there is no document for implement plug-in, but will be available soon.
You can refer to [example code](https://github.com/bluemir/wikinote/tree/master/plugins/comment) before then.

There are default plug-ins can use just configure.

* Reveal.js
* Simple Comment
* Disqus
* remark

## Contribute
If you want to participate this project,
please visit [Github repository](https://github.com/bluemir/wikinote).
Feel free to submit pull request.

<hr style="margin:100px auto;"/>

<a name="ko"></a>

## 특징
* [markdown](http://daringfireball.net/projects/markdown)을 이용한 간략한 문법
* 실시간 동시 편집 가능
* DB를 사용하지 않고, 일반 파일로 저장(일반 텍스트에디터로 편집가능)
* history관리(using git)
* 인증 & 권한 관리
* 손쉬운 설치/백업(폴더 복사만으로 백업 완료)

## Install & Run

```
# using docker
docker run -d -p <port>:4000 -v <data directory>:/wikinote/data bluemir/wikinote


# using npm (require nodejs v4.x)
npm install -g wikinote
wikinote


# from source (require nodejs v4.x)
git clone https://github.com/bluemir/wikinote.git
cd wikinote
npm install
node wikinote.js
```

## 문법
WikiNote는 [marked](https://github.com/chjj/marked)를 markdown parser와 renderer로 사용합니다. [GFM(Github Flavored Markdown)](https://help.github.com/articles/github-flavored-markdown) 또한 지원합니다. 문법에 대해서는 아래 두 문서를 참고하면 좋습니다.

* [Basic Markdown](http://daringfireball.net/projects/markdown/)
* [GFM](https://help.github.com/articles/github-flavored-markdown)

## Plug-ins
wikinote는 Plugin을 쉽게 제작할수 있도록 되어 있습니다.
더 많은 기능을 Plugin을 통해 간편하게 만들수 있습니다.
아직은 plugin에 대한 문서가 없지만, 곧 문서화 할 예정입니다.
그 전까지 [example code](https://github.com/bluemir/wikinote/tree/master/plugins/comment)를 참조해서
만드실수 있습니다.

기본으로 제공되는 Plug-in
* Reveal.js
* Simple Comment
* Disqus
* remark

## Contribute
만약 이 프로젝트에 새로운 기능을 제안하고 싶거나 버그를 알려주고 싶으시다면
[Github repository](https://github.com/bluemir/wikinote/issues)로 알려주시면 됩니다.
물론 pull request도 환영합니다.
