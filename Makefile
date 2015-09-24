PACKAGE_NAME=people-service


.FORCE:
	echo "FORCE was run"


all: build test

build: build-amd build-commonjs build-server-tests build-client-tests

test: test-server test-client

.PHONY: setup
setup:
	npm install
	tsd install



.PHONY: clean
clean:
	rm -fr amd commonjs generated
	mkdir amd commonjs generated


.PHONY: echo
echo:
	echo decl_files=$(decl_files)


decl_files=$(wildcard typings/$(PACKAGE_NAME)/*.d.ts)


amd/%.js: src/client/ts/%.ts $(decl_files)
	tsc --noEmitOnError --module amd --outDir generated $<
	mv generated/$(@F) amd

amd/%.js: src/common/ts/%.ts $(decl_files)
	tsc --noEmitOnError --module amd --outDir generated $<
	mv generated/$(@F) amd

amd/%.js: test/src/client/ts/%.ts $(decl_files)
	tsc --noEmitOnError --module amd --outDir generated $<
	mv generated/$(@F) amd

amd/%.js: test/e2e//ts/%.ts $(decl_files)
	tsc --noEmitOnError --module amd --outDir generated $<
	mv generated/$(@F) amd


commonjs/%.js: src/server/ts/%.ts $(decl_files)
	tsc --noEmitOnError --module commonjs --outDir generated $<
	mv generated/$(@F) commonjs

commonjs/%.js: src/common/ts/%.ts $(decl_files)
	tsc --noEmitOnError --module commonjs --outDir generated $<
	mv generated/$(@F) commonjs

commonjs/%.js: test/src/server/ts/%.ts $(decl_files)
	tsc --noEmitOnError --module commonjs --outDir generated $<
	mv generated/$(@F) commonjs



client_srcs := $(wildcard src/client/ts/*.ts) $(wildcard src/common/ts/*.ts)
client_srcs_basenames = $(notdir $(client_srcs))
client_output_basenames = $(client_srcs_basenames:ts=js)
client_amd_filenames = $(addprefix amd/, $(client_output_basenames))
build-amd: $(client_amd_filenames)


test_client_srcs := $(wildcard test/src/client/ts/*.ts) $(wildcard test/e2e//ts/*.ts)
test_client_src_basenames = $(notdir $(test_client_srcs))
test_client_output_basenames = $(test_client_src_basenames:ts=js)
test_client_amd_filenames = $(addprefix amd/, $(test_client_output_basenames))
build-client-tests: $(test_client_amd_filenames)


server_srcs := $(wildcard src/server/ts/*.ts) $(wildcard src/common/ts/*.ts)
server_srcs_basenames = $(notdir $(server_srcs))
server_output_basenames = $(server_srcs_basenames:ts=js)
server_commonjs_filenames = $(addprefix commonjs/, $(server_output_basenames))
build-commonjs: $(server_commonjs_filenames)


test_server_srcs := $(wildcard test/src/server/ts/*.ts)
test_server_src_basenames = $(notdir $(test_server_srcs))
test_server_output_basenames = $(test_server_src_basenames:ts=js)
test_server_commonjs_filenames = $(addprefix commonjs/, $(test_server_output_basenames))
build-server-tests: $(test_server_commonjs_filenames)


.PHONY: test-server
test-server: build-commonjs build-server-tests
	bin/kill1 debug-brk
	mocha $(MOCHA_ARGS) -R spec $(test_server_commonjs_filenames)

start-servers:
	bin/start-servers.sh

stop-servers:
	bin/stop-servers.sh


test-client: build-amd build-client-tests
	karma start test/src/client/people.service.karma.conf.js

test-end-to-end: build-amd build-client-tests build-commonjs build-server-tests
	# bin/stop-servers.sh
	# bin/start-servers.sh --log
	# karma start test/e2e/people.e2e.karma.conf.js
	echo "End-to-end tests will be done with Protractor"
	# bin/stop-servers.sh
