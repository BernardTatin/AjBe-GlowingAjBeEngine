#/usr/bin/env dash

script=$(basename $0)

dohelp () {
    cat <<DOHELP
${script} [-h|--help]: this text
${script} html-filename.html [title]: create a new page
        in the html-filename.html and add a line in the
        local menu with the given title;
        if no title is provided, the value "no name" is used
DOHELP
    exit 0
}

dopage () {
    cat > $1 <<DOPAGE
<!DOCTYPE html>
<html>

    <head>
        <meta http-equiv="Pragma" content="no-cache" />
        <meta http-equiv="Expires" content="-1" />
        <meta charset='utf-8' />
    </head>

	<body>
        <!-- write some clever text here -->
	</body>
</html>
DOPAGE
}

addtomenu () {
    cat <<ADDTOMENU
WARNING: not implemented, sorry
WARNING: you must add a line in the file:
            $(dirname $1)/content.html
ADDTOMENU
}

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
                dopage $1 \
                    && addtomenu $1 "No title"
                exit 0
                ;;
        esac
		;;
    2)
        dopage $1 \
            && addtomenu $1 $2
        ;;
	*)
        echo "ERROR: too much arguments"
        exit 1
		;;
esac
