#Wikinote

[English](#english), [Korean](#korean)

----
####English

##Feature
* simple text formatting syntax using [markdown](http://daringfireball.net/projects/markdown)
* real-time Collaborative editing
* not using db, just using file system(edit with general text editor)
* history management using "git"
* authentication & authorization

##WikiNote is not wiki
While "Wiki" is content management system for collective intelligence in large group,
WikiNote is more suitable for smaller group or personal use.
A syntax of markdown is simpler than wiki syntax system.
Because most of complex wiki syntax didn't need. Simple is the best.

##Syntax
WikiNote use [marked](https://github.com/chjj/marked) as markdown parser and renderer.
It also render [GFM(Github Flavored Markdown)](https://help.github.com/articles/github-flavored-markdown).
There are good document for those syntax and listing blow.

* [Basic Markdown](http://daringfireball.net/projects/markdown/)
* [GFM](https://help.github.com/articles/github-flavored-markdown)

##Plug-in
Plug-ins are available in WikiNote which can make easily. If you want more plug-in, you can make them.
For now, there is no document for implement plug-in, but will be available soon.
You can refer to [example code](https://github.com/bluemir/wikinote/tree/master/plugins/comment) before then.

There are default plug-ins can use just configure.

* Reveal.js
* Simple Comment
* Disqus
* remark

##Install

###Prerequirements
* Linux(recommended) or OS X(not tested, but would be work)
* node.js
* git


###Download and Run
```
# git clone https://github.com/bluemir/wikinote.git
# cd wikinote & npm install
# npm start
```

you can consider [node-forever](https://github.com/foreverjs/forever) for running scripts continuously.

##Contribute
If you want to participate this project,
please visit [Github repository](https://github.com/bluemir/wikinote).
Feel free to submit pull request.

----
####Korean

##특징
* markdown을 이용한 간략한 문법
* 실시간 동시 편집 가능
* DB를 사용하지 않고, 일반 파일로 저장(일반 텍스트에디터로 편집가능)
* git으로 관리되는 history
* 기초적인 인증 & 권한 관리

##WikiNote is not wiki
wiki가 다수 사용자의 집단 지성을 모으는 도구로 사용된다면
WikiNote는 주로 개인의 생각을 정리하거나 작은 집단에서 사용하기에 좀 더 알맞습니다.
markdown문법은 위키문법보다 간결하고 기본적인 기능만 갖추어져 있습니다.
개인사용자는 wiki의 복잡한 문법이 대부분 필요없기 때문입니다.

##문법
WikiNote는 [marked](https://github.com/chjj/marked)를 markdown parser와 renderer로 사용합니다.
[GFM(Github Flavored Markdown)](https://help.github.com/articles/github-flavored-markdown)도
사용이 가능합니다. 두 문법에 대해서는 아래 두 문서를 참고하면 좋습니다.

* [Basic Markdown](http://daringfireball.net/projects/markdown/)
* [GFM](https://help.github.com/articles/github-flavored-markdown)

##PlugIn
wikinote는 Plugin을 쉽게 제작할수 있도록 되어 있습니다.
더 많은 Plugin을 원하면 간편하게 만들수 있습니다.
아직은 plugin에 대한 문서가 없지만, 곧 문서화 할 예정입니다.
그 전까지 [example code](https://github.com/bluemir/wikinote/tree/master/plugins/comment)를 참조해서
만드실수 있습니다.

기본으로 제공되는 Plug-in
* Reveal.js
* Simple Comment
* Disqus
* remark

##Install

###준비사항
* Linux(추천) or OS X(테스트는 안했지만 동작할껍니다)
* node.js
* git

###Download and Run
```
# git clone https://github.com/bluemir/wikinote.git
# cd wikinote & npm install
# npm start
```

서비스처럼 만들기 위해서는 [node-forever](https://github.com/foreverjs/forever)를
고려해 보세요.

##Contribute
만약 이 프로젝트에 새로운 기능을 제안하고 싶거나 수정사항을 알려주고 싶으시다면
[Github repository](https://github.com/bluemir/wikinote)로 알려주시면 됩니다.
물론 pull request도 환영합니다.


##Used Libaray
###Client side
* q.js
* code-mirror
* share-mirror
* web-font-loader

###Server side
* package.js 참조

##소개 동영상
<iframe width="560" height="315" src="https://www.youtube.com/embed/Ona_JaippdQ" frameborder="0" allowfullscreen></iframe>
