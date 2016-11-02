#!/bin/bash

gitBase=~/git
kernel=$gitBase/bright-marcel-kernel
othersites=$gitBase/bright-marcel

case $# in
	0)
		gitBase=~/git
		;;
	1)
		gitBase=$1
		;;
	2)
		gitBase=$1
		othersites=$2
		;;
	*)
		gitBase=$1
		othersites=$@
		;;
esac


prepareKernel () {
	cd $kernel
	for f in screen print default-font
	do
		lessc less/$f.less > css/$f.css
	done
}

prepareSite () {
	for site in $othersites
	do
		cd $site
		for f in local-font local
		do
			lessc --include-path=$kernel/less less/$f.less > css/$f.css
		done
	done
}

prepareKernel
prepareSite
