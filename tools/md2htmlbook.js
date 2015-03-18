var marked = require("marked");
var fs = require("fs");

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

function processSection(depth, type, section) {
    outHTML += "<section data-type='" + type + "'>";
    if (section.content) {
        var data = fs.readFileSync(section.content);
        outHTML += marked(data.toString("utf8"));
    }
    if (section.sections) {
        section.sections.forEach(function(sectionInfo) {
            processSection(depth + 1, "section", sectionInfo);
        });
    }
    outHTML += "</section>";
}

var renderer = new marked.Renderer();
/*
var prevHeaderRenderer = renderer.heading;
renderer.heading = function(text, level) {
    if (level != 1) {
        return prevHeaderRenderer(text, level);
    }

    return "<HELLO>";
}
*/

options.renderer = renderer;
marked.setOptions(options);

outHTML = "<html><head><title>" + bookOrg.title + "</title></head><body data-type='book'>";
bookOrg.sections.forEach(function(section) {
    processSection(1, "chapter", section);
});
outHTML += "</body></html>";
console.log(outHTML);