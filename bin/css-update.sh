#!/bin/sh

gitBase=~/git
kernel=$gitBase/marcel-kernel
marcel=$gitBase/marcel
poems=$gitBase/poems

prepareKernel () {
	cd $kernel
	for f in screen print default-font
	do
		lessc less/$f.less > css/$f.css
	done	
}

prepareSite () {
	for site in $marcel $poems
	do
		cd $site
		lessc --include-path=$kernel/less less/local-font.less > css/local-font.css
	done
}

prepareKernel
prepareSite
sitecopy --update marcel poemesengine marcel-kernel
