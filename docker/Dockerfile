FROM node:4
MAINTAINER BlueMir <bluemir@bluemir.me>

#Make wikinote storage
RUN mkdir /wikinote
RUN mkdir /wikinote/data

WORKDIR /wikinote

#Clone source file
RUN git clone --depth 1 https://github.com/bluemir/wikinote.git src && rm -rf src/.git

WORKDIR /wikinote/src
#RUN
RUN ["/bin/bash", "--login", "-c", "npm install"]

##configuration
ADD local.yaml /wikinote/src/config/

COPY entry.sh /wikinote/src/

VOLUME ["/wikinote/data"]

EXPOSE 4000
CMD ["/bin/bash", "--login", "-c", "./entry.sh"]

