#!/bin/bash

[ -e github-markdown.css ] \
    || wget https://raw.githubusercontent.com/sindresorhus/github-markdown-css/gh-pages/github-markdown.css

render_html() {
    (
        sed "s/TITLE-GOES-HERE/$3/" < pytch-page-header.html
        pandoc --quiet -f gfm -t html5 "$1"
        cat pytch-page-footer.html
    ) \
        > "$2"
}

render_html help.md help.html "Pytch: Help"
render_html about.md about.html "Pytch: About"
