var marked = require("marked");
var fs = require("fs");
var path = require("path");
var nsh = require('node-syntaxhighlighter');

var options = {
    gfm:true,
    tables:true,
    pedantic:false,
    smartLists:true,
    xhtml:true
};

var dirPrefix = "v3";

var bookOrg = JSON.parse(fs.readFileSync("v3/spec/book.json"));
//console.log(bookOrg);

var data = fs.readFileSync("README.md");
//console.log(marked.lexer(data.toString("utf8"), options));

var outHTML = "";

var renderer = new marked.Renderer();
renderer.sectionLevel = 0;

var curAnchorPrefix = "";
function makeAnchor(baseName, section) {
    
    var anchorName = baseName;
    anchorName = anchorName.replace("README", "");
    anchorName = anchorName.replace(/\//g, "_")
    anchorName = anchorName.replace(".md", "");
    if (/\.\._/.test(anchorName)) {
        var upPrefix = (section.parent && section.parent.prefix) || "";
        anchorName = anchorName.replace("\.\._", upPrefix + ((upPrefix.length > 0) ? "_" : ""));
    } else  if (curAnchorPrefix) {
        var curPrefix = anchorName.substring(0, curAnchorPrefix.length + 1);
        if (curPrefix != (curAnchorPrefix + "_")) {
            
            //console.log("Using prefix " + curAnchorPrefix + " on " + anchorName);
            anchorName = curAnchorPrefix + "_" + anchorName;
            //console.log("is now ", anchorName);
        }
    }
    return anchorName;
}

function fileToAnchor(section) {
    var parts = section.content.split(path.sep);
    parts.shift();
    if (parts[0] == dirPrefix) {
        parts.shift();
    }
    return makeAnchor(parts.join(path.sep), section);
}

function processSection(count, depth, type, section) {
    var prevSection = renderer.curSection;
    renderer.curSection = section;
    var prevPrefix = curAnchorPrefix;
    if (section.prefix) {
        //console.log("Set prefix to " + section.parent.prefix);
        curAnchorPrefix = section.prefix;
    }
    if (section.content) {
        renderer.nameTag = fileToAnchor(section);
        
        outHTML += "<a id='" + fileToAnchor(section) + "' name='" + fileToAnchor(section) + "'></a>";
    }
    outHTML += "<a id='" + type + "-" + count + "-" + depth + "' name='" + type + "-" + count + "-" + depth + "'></a><section data-type='" + type + "'>";
    if (section.content) {
        var data = fs.readFileSync(section.content);
        outHTML += marked(data.toString("utf8"));
    }
    if (section.sections) {
        section.sections.forEach(function(sectionInfo) {
            sectionInfo.parent = section;
            renderer.sectionLevel = depth + 1;
            processSection(count, depth + 1, "section", sectionInfo);
            renderer.sectionLevel = depth;
        });
    }

    curAnchorPrefix = prevPrefix;
    renderer.curSection = prevSection;

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
renderer.link = function(href, title, text) {
    // Passthrough absolute urls but inline link relatives
    var absUrlPattern = /^https?:\/\//i;
    if (absUrlPattern.test(href)) {
        return prevLinkRenderer.call(this, href, title, text);
    }

    var out = '<a class="xref" href="#' + makeAnchor(href, this.curSection) + '"';
    if (title) {
        out += ' title="' + title + '"';
    }
    out += '>' + text + '</a>';
    return out;
}

var prevCodeRenderer = renderer.code;
renderer.code = function(code, language) {
    if (!code) return "";
    if (!language) {
        return prevCodeRenderer.call(this, code, language);
    }
    //console.log("language is " + language + " on " + code);
    return nsh.highlight(code, nsh.getLanguage(language)).replace(/highlighter_\d+/,'code');
}


options.renderer = renderer;
marked.setOptions(options);

nsh.copyStyle("default", "tools/code-style", function(err) {
});

outHTML = "<html><head><title>" + bookOrg.title + "</title><link href='tools/pdf.css' type='text/css'></link><link href='tools/code-style/default.css' type='text/css'></link></head><body data-type='book'>";
var cnt = 1;
bookOrg.sections.forEach(function(section) {
    processSection(cnt, 1, "chapter", section);
    cnt += 1;
});
outHTML += "</body></html>";
console.log(outHTML);