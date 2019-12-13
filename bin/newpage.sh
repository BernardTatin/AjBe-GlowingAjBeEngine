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
    local dp_page_name=$1
    local dp_title=
    shift
    dp_title="$@"
    mkdir -p ${pages_base}/$(dirname $dp_page_name)
    cat > ${pages_base}/$dp_page_name <<DOPAGE
<!DOCTYPE html>
<html>

    <head>
        <meta http-equiv="Pragma" content="no-cache" />
        <meta http-equiv="Expires" content="-1" />
        <meta charset='utf-8' />
    </head>

	<body>
        <!-- file : $dp_page_name -->
        <!-- title: ${dp_title} -->
        <!-- write some clever text here -->
	</body>
</html>
DOPAGE
}

addtomenu () {
    local am_page_name=$1
    local am_title=
    shift
    am_title="$*"
    new_line="<li><p href='index.html?page=$(basename $am_page_name)&root=$(dirname $am_page_name)'>$am_title</p></li>"
    content_file=${pages_base}/$(dirname $am_page_name)/content.html
    grep -Fhqs "$new_line" $content_file \
        && echo "already in menu" \
        && return 0
    cp $content_file ${content_file}.bak
    cat > $content_file <<ADDTOMENU
<html>
    <head>
        <meta http-equiv="Pragma" content="no-cache" />
        <meta http-equiv="Expires" content="-1" />
        <meta charset='utf-8' />
    </head>
    <body>
        <ul style="display: block;">
$(grep -Fhs "<li><p href=" ${content_file}.bak)
            $new_line
        </ul>
    </body>
</html>
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
                page_name="$1"
                shift
                title='No Title'
                ;;
        esac
		;;
    *)
        page_name="$1"
        shift
        title="$*"
        ;;
esac

dopage "$page_name" "$title" \
    && addtomenu "$page_name" "$title"
