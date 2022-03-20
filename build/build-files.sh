cp -r server playgrounds/html-css-js-simple-app
cp -r server playgrounds/nodejs-simple-express-app
cp -r server playgrounds/node-playground

cd playgrounds/html-css-js-simple-app
sudo docker build -t html-css-js-simple-app .

cd ../nodejs-simple-express-app
sudo docker build -t nodejs-simple-express-app .

cd ../node-playground
sudo docker build -t node-playground .