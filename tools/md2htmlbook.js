var marked = require("marked");
var fs = require("fs");
var path = require("path");

var options = {
    gfm:true,
    tables:true,
    pedantic:false,
    smartLists:true,
    xhtml:true
};


var bookOrg = JSON.parse(fs.readFileSync("book.json"));
//console.log(bookOrg);

var data = fs.readFileSync("README.md");
//console.log(marked.lexer(data.toString("utf8"), options));

var outHTML = "";

var renderer = new marked.Renderer();
renderer.sectionLevel = 0;

function processSection(count, depth, type, section) {
    if (section.content) {
        renderer.nameTag = path.basename(section.content);
        outHTML += "<a id='" + path.basename(section.content) + "' name='" + path.basename(section.content) + "'></a>";
    }
    outHTML += "<a id='" + type + "-" + count + "-" + depth + "' name='" + type + "-" + count + "-" + depth + "'></a><section data-type='" + type + "'>";
    if (section.content) {
        var data = fs.readFileSync(section.content);
        outHTML += marked(data.toString("utf8"));
    }
    if (section.sections) {
        section.sections.forEach(function(sectionInfo) {
            renderer.sectionLevel = depth + 1;
            processSection(count, depth + 1, "section", sectionInfo);
            renderer.sectionLevel = depth;
        });
    }
    outHTML += "</section>";
}

var prevHeaderRenderer = renderer.heading;
renderer.heading = function(text, level, raw) {
    var out =  '<h' + (level + renderer.sectionLevel);
    if (renderer.nameTag) {
        out += ' id="' + renderer.nameTag + '"';
        renderer.nameTag = "";
    }
    out += '>' + text + '</h' + (level + renderer.sectionLevel)  + '>\n';
    return out;
}

var prevLinkRenderer = renderer.link;
renderer.link = function(href, title, text)
{
    // Passthrough absolute urls but inline link relatives
    var absUrlPattern = /^https?:\/\//i;
    if (absUrlPattern.test(href)) {
        return prevLinkRenderer.call(this, href, title, text);
    }

    var out = '<a class="xref" href="#' + href + '"';
    if (title) {
        out += ' title="' + title + '"';
    }
    out += '>' + text + '</a>';
    return out;
}


options.renderer = renderer;
marked.setOptions(options);

outHTML = "<html><head><title>" + bookOrg.title + "</title><link href='tools/pdf.css' type='text/css'></link></head><body data-type='book'>";
var cnt = 1;
bookOrg.sections.forEach(function(section) {
    processSection(cnt, 1, "chapter", section);
    cnt += 1;
});
outHTML += "</body></html>";
console.log(outHTML);