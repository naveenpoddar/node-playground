FROM node:12
WORKDIR /app
COPY app .
RUN npm install --global nodemon

COPY server/package.json /tmp/server/package.json
COPY server/package-lock.json /tmp/server/package-lock.json
COPY server/src /tmp/server/src
RUN cd /tmp/server && npm ci

EXPOSE 5858
EXPOSE 7777
