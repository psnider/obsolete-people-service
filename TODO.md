Upgrade VS Code after the bug in typescript version selection is fixed:
https://github.com/Microsoft/vscode/issues/10766

To make production work:

# components/server/src/ts/people-db.ts
var PORT = 27017

# components/shared/src/ts/person.ts
must rebuild repo to support corrent case of filename
