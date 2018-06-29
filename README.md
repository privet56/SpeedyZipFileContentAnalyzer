# SpeedyZipAnalyzer
## World's fastest ZIP Archive File Content Analyzer, built on NodeJS Stream/Pipes
### State: Work in Progress

![SpeedyZipFileContentAnalyzer2](https://raw.githubusercontent.com/privet56/SpeedyZipFileContentAnalyzer/master/SpeedyZipFileContentAnalyzer.png)

### libs/hints
	ZIP:
		npm install unzip --save
		npm install @types/unzip --save
	Console Output as Table: https://www.npmjs.com/package/cli-table , https://github.com/Automattic/cli-table
		npm install cli-table --save
		npm install @types/cli-table --save

		//npm i mediainfo --save				//https://github.com/deoxxa/node-mediainfo , need python 2.x & npm install --global --production windows-build-tools
		//npm install @types/mediainfo --save
		npm install mediainfo-wrapper --save	//use better this one, built binaries are included!

		//npm i stream-throttle	//no @types, no objectMode :-( -> TODO: fork & fix

### start command line app with:
	shell 1: npm run watch-ts
	shell 2: node dist/app.js
