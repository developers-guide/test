module.exports = function(env, callback) {
    function getDirectoryTitle(directory) {
        var index = directory['index.md'] || directory['index.json'];
        if(index) {
            return index.metadata.title;
        }
        return directory.filename || 'Unknown';
    }
    
    function generateToC(directory) {
        // start by building an object that maps from file name to either the file or an array of
        // the contents of the directory
        var tree = {};
        directory._.directories.forEach(function(directory) {
            tree[directory.filename] = {
                directory: directory,
                filename: directory.filename,
                url: directory.url,
                metadata: {
                    title: getDirectoryTitle(directory)
                },
                children: generateToC(directory)
            };
        });
        Object.getOwnPropertyNames(directory).filter(function(fileName) {
			return fileName.substr(0, 5) !== 'index' && directory[fileName] && directory[fileName].metadata && directory[fileName].metadata.view !== 'none';
		}).map(function(fileName) {
			return directory[fileName];
		}).sort(function(a, b) {
			return a.filename.localeCompare(b.filename);
		}).forEach(function(file) {
            tree[file.filename] = file;
        });
        // now convert it into an array that is sorted by the file names.
        var result = [];
        Object.getOwnPropertyNames(tree).sort().forEach(function(name) {
            result.push(tree[name]);
        });
        return result;
    }
    
    function buildToC(toc, currentUrl) {
        var content = '<ol class="toc">';
        toc.forEach(function(file) {
            content += '<li';
            if(file.url === currentUrl) {
                content += ' class="active"';
            }
            content += '>';
            if(file.children) {
                content += '<span class="list-header">' + file.metadata.title + '</span>';
                content += buildToC(file.children, currentUrl);
            } else {
                content += '<a href="';
                content += file.url;
                content += '">' + file.metadata.title + '</a>';
            }
            content += '</li>';
        });
        return content + '</ol>';
    }
    
    env.utils.buildToC = function(contents, book, currentUrl) {
        return buildToC(generateToC(contents.book[book]), currentUrl);
    };
    
    callback();
};