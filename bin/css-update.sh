#!/bin/bash

gitBase=~/git
kernel=
others=

script=$(basename $0)

# just print help text on console
showhelp() {
	cat << DOHELP
$script [-h|--help] : this text
$script --kernel kernel-dir --other site [ --other site ...]
DOHELP
}

# show help and exit without error
dohelp() {
	showhelp
	exit 0
}

# show error message, show help text and exit with code != 0
onerror() {
	local exit_code=$1
	shift
	echo "ERROR: $@" 1>&2
	echo ""
	showhelp
	exit $exit_code
}

# we must have 2 or more parameters
case $# in
	0)
		dohelp
		;;
	1)
		case $1 in
			-h|--help)
				dohelp
				;;
			*)
				onerror 1 "Unknown option $1"
				;;
		esac
		;;
esac

# read parameters
while [ $# -gt 0 ]
do
	case $1 in
		--kernel)
			shift
			[ $# -eq 0 ] && onerror 2 "$1 needs a parameter"
			kernel=$1
			;;
		--other)
			shift
			[ $# -eq 0 ] && onerror 2 "$1 needs a parameter"
			others="$others $1"
			;;
		*)
			onerror 1 "Unknown option $1"
			;;
	esac
	shift
done

# verify kernel exists
[[ -z $kernel ]] && onerror 5 "You must provide a --kernel option"
! [[ -d $kernel ]] && onerror 6 "$kernel is not a directory or does not exists"
[[ -z $others ]] && onerror 5 "You must provide at least one --other option"
for site in $others
do
	! [[ -d $site ]] && onerror "Site $site does not exists or it's not a directory"
done

prepareKernel () {
	cd $kernel
	for f in screen print default-font
	do
		lessc less/$f.less > css/$f.css || onerror 4 "lessc less/$f.less > css/$f.css"
	done
}

prepareSite () {
	for site in $others
	do
		cd $site
		for f in local-font local
		do
			lessc --include-path=$kernel/less less/$f.less > css/$f.css || onerror 4 "lessc --include-path=$kernel/less less/$f.less > css/$f.css"
		done
	done
}

prepareKernel
prepareSite
