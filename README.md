#wikinote
--
##What is wikinote
wikinote는 위키같은 메모장을 사용하고 싶은 마음에서 시작되었습니다.
철저하게 개인화된 위키를 지향하며 markdown문법을 사용합니다.

##How To Install/Run
```
# git clone https://github.com/HyeokJun/wikinote.git
# cd wikinote & npm install
# npm start
```
##Wikinote의 기능
 * 문서 작성
  * markdown(gfm 지원)
  * markdown 렌더링
 * histroy관리
 * presentation(reveal.js)
 * 단축키 지원
 * 로그인 및 편집 권한 관리 지원

##wikinote의 특징
 * DB를 전혀사용하지 않는다.
 * 저장된파일들이 바로 편집 가능한 상태로 존재한다.
  * wikinote를 통하지 않더라도 사용가능하다.
 * markdown문법을 사용한다.
 * git을 이용하여 history를 관리한다.

###주의
 * history 기능은 현재 git에 dependency를 가지고 있습니다. 
   history기능을 사용하기 위해서는 반드시 시스템에 git이 깔려 있어야 합니다.
   추후 javascript git module로 바꿀 예정입니다.
