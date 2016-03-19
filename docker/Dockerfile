FROM fedora:latest
MAINTAINER BlueMir <bluemir@bluemir.me>

#Run Upgrade / Install tools
RUN dnf -y update && \
	dnf -y install \
	findutils \
	tar \
	git \
	&& dnf clean all

#make user
RUN useradd wikinote

USER wikinote
WORKDIR /home/wikinote

#Install NVM
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh | bash
RUN ["/bin/bash", "--login", "-c", "nvm install v4 && nvm alias default v4 && nvm use v4"]

#Make wikinote storage
RUN mkdir data

#Clone source file
RUN git clone --depth 1 https://github.com/bluemir/wikinote.git src && rm -rf src/.git

WORKDIR /home/wikinote/src
#RUN
RUN ["/bin/bash", "--login", "-c", "npm install"]

##configuration
ADD local.yaml /home/wikinote/src/config/

COPY entry.sh .

VOLUME ["/home/wikinote/data"]

EXPOSE 4000
CMD ["/bin/bash", "--login", "-c", "./entry.sh"]

