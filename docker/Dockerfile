FROM fedora:latest
MAINTAINER BlueMir <bluemir@bluemir.me>

#Run Upgrade
RUN yum -y update

#Install Tools
RUN yum -y groupinstall 'Development Tools'
RUN yum -y install git wget tar gcc-c++

#make user
RUN useradd wikinote
USER wikinote
WORKDIR /home/wikinote

#Install NVM
RUN wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.25.1/install.sh | sh
RUN ["/bin/bash", "--login", "-c", "nvm install iojs && nvm alias default iojs && nvm use iojs"]

#Clone source file
RUN git clone https://github.com/bluemir/wikinote.git

#Make wikinote storage
RUN mkdir /home/wikinote/wiki

#RUN
WORKDIR /home/wikinote/wikinote
RUN ["/bin/bash", "--login", "-c", "npm install"]

EXPOSE 4000
CMD ["/bin/bash", "--login", "-c", "node app.js"]

