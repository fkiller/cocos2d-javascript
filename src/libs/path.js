exports.dirname = function(path) {
    var tokens = path.split('/');
    tokens.pop();
    return tokens.join('/');
};
exports.basename = function(path) {
    var tokens = path.split('/');
    return tokens[tokens.length-1];
};

exports.join = function () {
    return exports.normalize(Array.prototype.join.call(arguments, "/"));
};

exports.exists = function(path) {
    return (window.__resources__[path] !== undefined);
};

exports.normalizeArray = function (parts, keepBlanks) {
  var directories = [], prev;
  for (var i = 0, l = parts.length - 1; i <= l; i++) {
    var directory = parts[i];

    // if it's blank, but it's not the first thing, and not the last thing, skip it.
    if (directory === "" && i !== 0 && i !== l && !keepBlanks) continue;

    // if it's a dot, and there was some previous dir already, then skip it.
    if (directory === "." && prev !== undefined) continue;

    // if it starts with "", and is a . or .., then skip it.
    if (directories.length === 1 && directories[0] === "" && (
        directory === "." || directory === "..")) continue;

    if (
      directory === ".."
      && directories.length
      && prev !== ".."
      && prev !== "."
      && prev !== undefined
      && (prev !== "" || keepBlanks)
    ) {
      directories.pop();
      prev = directories.slice(-1)[0]
    } else {
      if (prev === ".") directories.pop();
      directories.push(directory);
      prev = directory;
    }
  }
  return directories;
};

exports.normalize = function (path, keepBlanks) {
  return exports.normalizeArray(path.split("/"), keepBlanks).join("/");
};

