# makefile (c) 2012 M A Chatterjee
#remember makefiles require real tabs not spaces

build:
	./tools/update-jado-package.js package.json package.json
	uglifyjs jado.js -o  jado.min.js
	npm pack

test:
	./node_modules/mocha/bin/mocha test/jado_test.js --reporter spec

lint:
	./node_modules/.bin/eslint jado.js

clean:
	rm jado*.tgz -f

.PHONY: test

