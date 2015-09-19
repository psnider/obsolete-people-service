PACKAGE_NAME=people-service


.FORCE:
	echo "FORCE was run"


all: build test

build: build-commonjs build-tests

setup:
	npm install
	tsd install



.PHONY: clean
clean:
	rm -fr commonjs generated
	mkdir commonjs


.PHONY: echo
echo:
	echo decl_files=$(decl_files)


decl_files=$(wildcard typings/$(PACKAGE_NAME)/*.d.ts)


commonjs/%.js: src/ts/%.ts $(decl_files)
	tsc --noEmitOnError --module commonjs --outDir generated $<
	mv generated/$(@F) commonjs


commonjs/%.js: test/src/ts/%.ts $(decl_files)
	tsc --noEmitOnError --module commonjs --outDir generated $<
	mv generated/$(@F) commonjs



srcs := $(wildcard src/ts/*.ts)
srcs_basenames = $(notdir $(srcs))
output_basenames = $(srcs_basenames:ts=js)
commonjs_filenames = $(addprefix commonjs/, $(output_basenames))

build-commonjs: $(commonjs_filenames)


test_srcs := $(wildcard test/src/ts/*.ts)
test_src_basenames = $(notdir $(test_srcs))
test_output_basenames = $(test_src_basenames:ts=js)
test_commonjs_filenames = $(addprefix commonjs/, $(test_output_basenames))

build-tests: $(test_commonjs_filenames)

.PHONY: test
test: build-tests $(test_commonjs_filenames)
	./kill1 debug-brk
	mocha $(MOCHA_ARGS) -R spec $(test_commonjs_filenames)
