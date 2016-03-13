PACKAGE_NAME=people-service


.FORCE:
	echo "FORCE was run"


all: build test

build: build-client build-server build-server-tests build-client-tests build-e2e-tests

test: test-server test-client test-end-to-end

.PHONY: setup
setup:
	npm install
	tsd install

update-client-lib:
	cp bower_components/angular/angular.js lib
	cp bower_components/angular-bootstrap/ui-bootstrap-tpls.js lib
	cp bower_components/angular-route/angular-route.js lib
	cp bower_components/requirejs/require.js lib
	cp bower_components/requirejs-domready/domReady.js lib
	cp node_modules/tv4/tv4.js lib
	cp src/client/js/*.js lib


.PHONY: clean
clean:
	rm -fr amd commonjs generated
	mkdir amd commonjs generated


.PHONY: echo
echo:
	echo test_server_commonjs_filenames=$(test_server_commonjs_filenames)


decl_files=$(wildcard typings/$(PACKAGE_NAME)/*.d.ts)


amd/%.js: src/client/ts/%.ts $(decl_files)
	tsc --noEmitOnError --module amd --outDir $(@D) $<

client_specific_srcs := $(wildcard src/client/ts/*.ts)
client_specific_srcs_basenames = $(notdir $(client_specific_srcs))
client_specific_output_basenames = $(client_specific_srcs_basenames:ts=js)
client_specific_amd_filenames = $(addprefix amd/, $(client_specific_output_basenames))
build-client-specific: $(client_specific_amd_filenames)


amd/%.js: src/common/ts/%.ts $(decl_files)
	tsc --noEmitOnError --module amd --outDir $(@D) $<

client_common_srcs := $(wildcard src/common/ts/*.ts)
client_common_srcs_basenames = $(notdir $(client_common_srcs))
client_common_output_basenames = $(client_common_srcs_basenames:ts=js)
client_common_amd_filenames = $(addprefix amd/, $(client_common_output_basenames))
build-client-common: $(client_common_amd_filenames)


amd/%.js: test/src/client/ts/%.ts $(decl_files)
	tsc --noEmitOnError --module amd --outDir $(@D) $<

test_client_srcs := $(wildcard test/src/client/ts/*.ts)
test_client_src_basenames = $(notdir $(test_client_srcs))
test_client_output_basenames = $(test_client_src_basenames:ts=js)
test_client_amd_filenames = $(addprefix amd/, $(test_client_output_basenames))
build-client-tests: $(test_client_amd_filenames)


build-client: build-client-specific build-client-common build-client-tests



commonjs/%.js: src/server/ts/%.ts $(decl_files)
	tsc --noEmitOnError --module commonjs --outDir generated $<
	mv generated/$(@F) commonjs

commonjs/%.js: src/common/ts/%.ts $(decl_files)
	tsc --noEmitOnError --module commonjs --outDir generated $<
	mv generated/$(@F) commonjs

commonjs/%.js: test/src/server/ts/%.ts $(decl_files)
	tsc --noEmitOnError --module commonjs --outDir generated $<
	mv generated/$(@F) commonjs

commonjs/%.js: test/e2e/ts/%.ts $(decl_files)
	tsc --noEmitOnError --module commonjs --outDir generated $<
	mv generated/$(@F) commonjs



server_srcs := $(wildcard src/server/ts/*.ts) $(wildcard src/common/ts/*.ts)
server_srcs_basenames = $(notdir $(server_srcs))
server_output_basenames = $(server_srcs_basenames:ts=js)
server_commonjs_filenames = $(addprefix commonjs/, $(server_output_basenames))
build-server: $(server_commonjs_filenames)


test_server_srcs := $(wildcard test/src/server/ts/*.ts)
test_server_src_basenames = $(notdir $(test_server_srcs))
test_server_output_basenames = $(test_server_src_basenames:ts=js)
test_server_commonjs_filenames = $(addprefix commonjs/, $(test_server_output_basenames))
build-server-tests: $(test_server_commonjs_filenames)


test_e2e_srcs := $(wildcard test/e2e/ts/*.ts)
test_e2e_src_basenames = $(notdir $(test_e2e_srcs))
test_e2e_output_basenames = $(test_e2e_src_basenames:ts=js)
test_e2e_commonjs_filenames = $(addprefix commonjs/, $(test_e2e_output_basenames))
build-e2e-tests: $(test_e2e_commonjs_filenames)


start-servers:
	bin/start-servers.sh

stop-servers:
	bin/stop-servers.sh


.PHONY: test-server
test-server: build-server build-server-tests
	@echo "========= server tests ========================================================="
	bin/kill1 debug-brk
	NODE_PATH=commonjs  mocha $(MOCHA_ARGS) -R spec $(test_server_commonjs_filenames)

test-client: build-client build-client-tests
	@echo "========= client tests ========================================================="
	karma start test/src/client/people-ng-service.karma.conf.js

#alias
test-e2e: test-end-to-end

test-end-to-end: build-client build-client-tests build-server build-server-tests build-e2e-tests update-client-lib
	@echo "========= end-to-end tests ====================================================="
	@echo "WARNING: Assuming you have already run: webdriver-manager start"
	bin/stop-servers.sh
	bin/start-servers.sh --log --save
	protractor --framework mocha test/e2e/protractor.conf.js
	bin/stop-servers.sh
