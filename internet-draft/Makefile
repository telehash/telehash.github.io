all:
	mmark -xml2 -page TMesh.md > draft-miller-tmesh-00.xml
	xml2rfc draft-miller-tmesh-00.xml

install:
	go get github.com/miekg/mmark
	go install github.com/miekg/mmark/mmark
	sudo port install xml2rfc
