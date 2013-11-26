bin        = $(shell npm bin)
lsc        = $(bin)/lsc
browserify = $(bin)/browserify
groc       = $(bin)/groc
uglify     = $(bin)/uglifyjs
VERSION    = $(shell node -e 'console.log(require("./package.json").version)')


lib: src/*.ls
	$(lsc) -o lib -c src/*.ls

dist:
	mkdir -p dist

dist/control.async.umd.js: compile dist
	$(browserify) lib/index.js --standalone Async > $@

dist/control.async.umd.min.js: dist/control.async.umd.js
	$(uglify) --mangle - < $^ > $@

# ----------------------------------------------------------------------
bundle: dist/control.async.umd.js

minify: dist/control.async.umd.min.js

compile: lib

documentation:
	$(groc) --index "README.md"                                              \
	        --out "docs/literate"                                            \
	        src/*.ls test/*.ls test/specs/**.ls README.md

clean:
	rm -rf dist build lib

test:
	$(lsc) test/tap.ls

package: compile documentation bundle minify
	mkdir -p dist/control.async-$(VERSION)
	cp -r docs/literate dist/control.async-$(VERSION)/docs
	cp -r lib dist/control.async-$(VERSION)
	cp dist/*.js dist/control.async-$(VERSION)
	cp package.json dist/control.async-$(VERSION)
	cp README.md dist/control.async-$(VERSION)
	cp LICENCE dist/control.async-$(VERSION)
	cd dist && tar -czf control.async-$(VERSION).tar.gz control.async-$(VERSION)

publish: clean
	npm install
	npm publish

bump:
	node tools/bump-version.js $$VERSION_BUMP

bump-feature:
	VERSION_BUMP=FEATURE $(MAKE) bump

bump-major:
	VERSION_BUMP=MAJOR $(MAKE) bump


.PHONY: test
