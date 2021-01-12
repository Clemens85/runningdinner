## How To

In lib-export Ordner folgendes (einmalig) ausführen:<br/>
`sudo npm link`

Damit kann der aktuelle Codestand ohne Neubauen immer sofort eingebunden werden.

Im Client, dann folgendes ausführen, damit ist die Lib dann eingebunden:<br>
`npm link runningdinner-shared` 

## Bauen

In lib Folder: <br>
`npm run build`

Links:<br>
https://www.valentinog.com/blog/babel/<br>
https://stackoverflow.com/questions/33460420/babel-loader-jsx-syntaxerror-unexpected-token

## NPM Publish

Verdaccio als lokaler NPM Proxy (Derzeit In-Memory als Docker-Service):
=> Erreichbar unter http://localhost:4873/

Ggfalls folgender Befehl ausführen vor erstmaligem docker-compose up:
`sudo chown -R 10001:65533 verdaccio/`

`npm adduser --registry http://localhost:4873`
=> Damit gibt es neuen User für Publishing<br/>
=> Publishen ist anonym möglich oder mit vorgefertigem User ()

`npm publish`

`npm version patch`
<br/> => Erzeugt neue Minor-Version in package.json (siehe auch https://stackoverflow.com/questions/13059991/update-package-json-version-automatically/51417386) 

## Nützliche Links
https://stackoverflow.com/questions/41289200/output-an-es-module-using-webpack !!!

https://medium.com/better-programming/how-to-publish-a-react-component-library-c89a07566770

https://medium.com/better-programming/building-a-react-components-library-f5a390d5973d

