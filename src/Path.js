/* globals Wsh: false */
/* globals __dirname: false */
/* globals __filename: false */
/* eslint no-unused-vars: "off" */

/**
 * The script file path which is specified 1st argument by cscript.exe or wscript.exe. It is not this script path.
 *
 * @global
 * @constant {string}
 */
if (!__filename) var __filename = String(WScript.ScriptFullName);

/**
 * The parent directory path of `__filename`. Note the difference from `process.cwd`,  `WScript.CreateObject('WScript.Shell').CurrentDirectory`
 *
 * @global
 * @constant {string}
 */
if (!__dirname) var __dirname = __filename.replace(/\\[^\\]+$/, '');

(function () {
  if (Wsh && Wsh.Path) return;

  /**
   * Shorthand of WScript.CreateObject('WScript.Shell')
   *
   * @namespace Shell
   * @memberof Wsh
   */
  if (!Wsh.Shell) Wsh.Shell = WScript.CreateObject('WScript.Shell');

  /**
   * Shorthand of WScript.CreateObject('Scripting.FileSystemObject')
   *
   * @namespace FileSystemObject
   * @memberof Wsh
   */
  if (!Wsh.FileSystemObject) {
    Wsh.FileSystemObject = WScript.CreateObject('Scripting.FileSystemObject');
  }

  /**
   * Adds functions (similar to Node.js path) that handles file path strings into WSH.
   *
   * @namespace Path
   * @memberof Wsh
   * @requires {@link https://github.com/tuckn/WshUtil|WshUtil}
   */
  Wsh.Path = {};

  // Shorthands
  var util = Wsh.Util;
  var sh = Wsh.Shell;
  var fso = Wsh.FileSystemObject;

  var isString = util.isString;
  var isSolidString = util.isSolidString;
  var isSameStr = util.isSameMeaning;
  var includes = util.includes;
  var endsWith = util.endsWith;
  var startsWith = util.startsWith;

  var path = Wsh.Path;

  /** @constant {string} */
  var MODULE_TITLE = 'WshModeJs/Path.js';

  var throwErrNonStr = function (functionName, typeErrVal) {
    util.throwTypeError('string', MODULE_TITLE, functionName, typeErrVal);
  };

  /**
   * Windows path delimiter.
   *
   * @example
var path = Wsh.Path; // Shorthand

console.log(path.delimiter); // ;
   * @name delimiter
   * @memberof Wsh.Path
   * @constant {string}
   */
  path.delimiter = ';'; // for Windows

  /**
   * Windows path segment separator.
   *
   * @example
var path = Wsh.Path; // Shorthand

console.log(path.sep); // \
   * @name sep
   * @memberof Wsh.Path
   * @constant {string}
   */
  path.sep = '\\'; // for Windows

  // path.isUNC {{{
  /**
   * Checks if the string is UNC ({@link https://en.wikipedia.org/wiki/Path_(computing)#Universal_Naming_Convention|Universal Naming Convention}).
   *
   * @example
var path = Wsh.Path;

path.isUNC('\\\\CompName'); // false
path.isUNC('\\\\CompName\\'); // false
path.isUNC('\\\\CompName\\SharedDir'); // true

// Long UNC
path.isUNC('\\\\?\\UNC\\CompName\\SharedDir'); // true

// LFS (Local File System)
path.isUNC('C:\\foo\\bar.baz'); // false

// Unix-like (POSIX)
path.isUNC('//CompName//SharedDir'); // false
   * @function isUNC
   * @memberof Wsh.Path
   * @param {string} str - The string to check.
   * @returns {boolean} - Returns true if the string is an UNC, else false.
   */
  path.isUNC = function (str) {
    if (!isString(str)) throwErrNonStr('path.isUNC', str);
    return /^\\{2}(\?UNC\\)?[^/\\]+[/\\][^/\\]+/i.test(str);
  }; // }}}

  // path.dirname {{{
  /**
   * Returns the directory name of the path. Similar to {@link https://nodejs.org/api/path.html#path_path_dirname_path|Node.js Path}.
   *
   * @example
var path = Wsh.Path;

path.dirname('C:\\My Data\\image.jpg');
// Returns: 'C:\\My Data'

path.dirname('C:\\My Data');
// Returns: 'C:\\'

path.dirname('C:\\');
// Returns: 'C:\\'

// UNC
path.dirname('\\\\CompName\\SharedDir\\photo.jpg');
// Returns: '\\\\CompName\\SharedDir\\'

path.dirname('\\\\CompName\\SharedDir');
// Returns: '\\\\CompName\\SharedDir'

// Unix-like (POSIX)
path.dirname('C:/foo/bar/baz/asdf/quux');
// Returns: 'C:/foo/bar/baz/asdf'
   * @function dirname
   * @memberof Wsh.Path
   * @param {string} str - The path to convert.
   * @returns {string} - The directory name of path.
   */
  path.dirname = function (str) {
    if (!isString(str)) throwErrNonStr('path.dirname', str);

    /*
     * @note Node.jsでは "C:\"に相当するUNCパスは"\\cpmp\dir\"としているようだ
     *   これはUNCに対するfso.GetParentFolderNameの動作とは異なる
     */
    if (/^[/\\]{2}[^/\\]+[/\\]?$/i.test(str)) return path.sep;
    if (/^[/\\]{2}[^/\\]+[/\\][^/\\]+[/\\]?$/i.test(str)) return str;
    if (/^[a-z]:[/\\]?$/i.test(str)) return str;

    var dirname = fso.GetParentFolderName(str);

    if (dirname === '') return '.';
    /*
     * @note fso.GetParentFolderNameは"\\cpmp\dir\..."のとき"\\cpmp\dir"となる
     *   これはNode.jsの動作とは異なるのであわせるため末尾に\\を付与
     */
    if (/^[/\\]{2}[^/\\]+[/\\][^/\\]+$/i.test(dirname)) {
      return dirname + path.sep;
    }
    return dirname;
  }; // }}}

  // path.basename {{{
  /**
   * Returns the last portion of the path all given path segments. Similar to {@link https://nodejs.org/api/path.html#path_path_basename_path_ext|Node.js Path}.
   *
   * @example
var path = Wsh.Path;

path.basename('C:\\foo\\bar\\baz\\quux.html');
// Returns: 'quux.html'

path.basename('C:\\foo\\bar\\baz\\quux.html', '.html');
// Returns: 'quux'

path.basename('C:\\my-repo\\.gitignore', '.gitignore');
// Returns: '.gitignore'

path.basename('C:\\My Data');
// Returns: 'My Data'

// UNC
path.basename('\\\\CompName\\SharedDir\\photo.jpg');
// Returns: 'photo.jpg'

path.basename('\\\\CompName\\SharedDir');
// Returns: 'SharedDir'

path.basename('\\\\CompName\\');
// Returns: 'CompName'
   * @function basename
   * @memberof Wsh.Path
   * @param {string} str - The path to convert.
   * @param {string} [ext] - An optional file extension.
   * @returns {string} - The last position of the path.
   */
  path.basename = function (str, ext) {
    if (!isString(str)) throwErrNonStr('path.basename', str);

    // @note Imitate the behavior of Node.js path.basename
    if (/^[/\\]{2}/i.test(str)) {
      str = str.replace(/^[/\\]{2}/, '');
    }

    var baseName = fso.GetFileName(str); // @NOTE basename = name + ext
    var remExtName;

    if (isSolidString(ext)) {
      remExtName = fso.GetFileName(baseName).replace(new RegExp(ext + '$'), '');
      if (remExtName === '') return baseName;
      return remExtName;
    }
    return baseName;
  }; // }}}

  // path.extname {{{
  /**
   * Returns the extension of the path. Similar to {@link https://nodejs.org/api/path.html#path_path_extname_path|Node.js Path}.
   *
   * @example
var path = Wsh.Path;

path.extname('index.html');
// Returns: '.html'

path.extname('index.coffee.md');
// Returns: '.md'

path.extname('.gitignore');
// Returns: ''

path.extname('C:\\foo\\bar\\baz\\quux.html');
// Returns: '.html'

// UNC
path.extname('\\\\CompName\\SharedDir\\photo.jpg');
// Returns: '.jpg'

path.extname('\\\\CompName\\SharedDir');
// Returns: ''
   * @function extname
   * @memberof Wsh.Path
   * @param {string} str - The path to convert.
   * @returns {string} - the extension of the path.
   */
  path.extname = function (str) {
    if (!isString(str)) throwErrNonStr('path.extname', str);

    if (endsWith(str, '.')) return '.';

    var baseName = fso.GetFileName(str);
    var extName = '.' + fso.GetExtensionName(str);

    if (extName === baseName) return '';
    return (extName === '.') ? '' : extName;
  }; // }}}

  // path.parse {{{
  /**
   * Returns an object whose properties. Similar to {@link https://nodejs.org/api/path.html#path_path_parse_path|Node.js Path}.
   *
   * @example
var path = Wsh.Path;

path.parse('C:\\home\\user\\dir\\file.txt');
// Returns:
// { root: 'C:\\',
//   dir: 'C:\\home\\user\\dir',
//   base: 'file.txt',
//   ext: '.txt',
//   name: 'file' };

path.parse('\\\\CompName\\Public\\photo3.jpg');
// Returns:
// { root: '\\\\CompName\\Public\\',
//   dir: '\\\\CompName\\Public\\',
//   base: 'photo3.jpg',
//   ext: '.jpg',
//   name: 'photo3' };

path.parse('C:\\.git');
// Returns:
// { root: 'C:\\',
//   dir: 'C:\\',
//   base: '.git',
//   ext: '',
//   name: '.git' };

// Unix-like (POSIX)
path.parse('C:/home/user/dir/file.txt');
// Returns:
// { root: 'C:/',
//   dir: 'C:/home/user/dir',
//   base: 'file.txt',
//   ext: '.txt',
//   name: 'file' };
   * @function parse
   * @memberof Wsh.Path
   * @param {string} str - The path to parse.
   * @returns {object} - The parsed object.
   */
  path.parse = function (str) {
    if (!isString(str)) throwErrNonStr('path.parse', str);

    var root = '';
    if (path.isUNC(str)) {
      root = str.match(/^([/\\]{2}[^/\\]+[/\\]?([^/\\]+)?[/\\]?)/i)[1];
    } else if (/^[a-z]:[/\\]?/i.test(str)) {
      root = str.match(/^([a-z]:[/\\]?)/i)[1];
    }

    var baseName = path.basename(str); // 'bar.js' (basename = name + ext)
    var extName = path.extname(str); // '.js'

    return {
      root: root,
      dir: path.dirname(str),
      base: baseName,
      ext: extName,
      name: path.basename(baseName, extName)
    };
  }; // }}}

  // path.isAbsolute {{{
  /**
   * Determines if path is an absolute path. Similar to {@link https://nodejs.org/api/path.html#path_path_isabsolute_path|Node.js Path}.
   *
   * @example
var path = Wsh.Path;

path.isAbsolute('C:\\My Data\\hoge.png'); // true
path.isAbsolute('C:\\My Data\\..'); // true
path.isAbsolute('bar\\baz'); // false
path.isAbsolute('.'); // false
// UNC
path.isAbsolute('\\\\CompName'); // true
// Unix-like (POSIX)
path.isAbsolute('C:/My Data/hoge.png'); // true
path.isAbsolute('C:/My Data/..'); // true
path.isAbsolute('//CompName'); // true
path.isAbsolute('bar/baz'); // false
   * @function isAbsolute
   * @memberof Wsh.Path
   * @param {string} str - The path to check.
   * @returns {boolean} - Returns true if the string is an absolute, else false.
   */
  path.isAbsolute = function (str) {
    if (!isString(str)) throwErrNonStr('path.isAbsolute', str);

    return /^([a-z]:|[/\\]{2}[^/\\]+)/i.test(str);
  }; // }}}

  // path.normalize {{{
  /**
   * Resolve '..' and '.' segments. Replace path segment separation characters. Similar to {@link https://nodejs.org/api/path.html#path_path_normalize_path|Node.js Path}.
   *
   * @todo '~' to '%USERPROFILE%'
   * @example
var path = Wsh.Path;

path.normalize('C:\\temp\\\\foo\\bar\\..\\');
// Returns: 'C:\\temp\\foo\\'

path.normalize('C:////temp\\\\/\\/\\/foo/bar');
// Returns: 'C:\\temp\\foo\\bar'

// bash.exe は/C/～がC:\を意味するが、それは解釈しない
path.normalize('C/Git/mingw64/bin/git.exe');
// Returns: 'C\\Git\\mingw64\\bin\\git.exe'

path.normalize('C:\\Git\\mingw64\\lib\\..\\etc\\.gitconfig');
// Returns: 'C:\\Git\\mingw64\\etc\\.gitconfig'

path.normalize('..\\.config\\settings.json');
// Returns: '..\\.config\\settings.json'

path.normalize('settings.json');
// Returns: 'settings.json'
   * @function normalize
   * @memberof Wsh.Path
   * @param {string} str - The path to convert.
   * @returns {string} - The formatted path.
   */
  path.normalize = function (str) {
    if (!isString(str)) throwErrNonStr('path.isAbsolute', str);

    if (str === '') return '.';
    if (str === '.' || str === '..') return str;

    // @TODO Replaces '\\' to path.sep.
    var ph = str.replace(/\//g, path.sep);
    if (!includes(ph, path.sep)) return ph;

    var matches;
    if (/^[a-z]:[\\]+/i.test(ph)) { // Windows
      matches = ph.match(/^([a-z]:)[\\]+(.*)/i);
    } else if (path.isUNC(ph)) { // UNC
      matches = ph.match(/^(\\\\[^\\]+)[\\]+(.*)/i);
    } else if (/^[^\\]+\\/i.test(ph)) { // Linux like
      matches = ph.match(/^([^\\]+)[\\]+(.*)/i);
    } else {
      matches = [null, '', ph];
    }

    var head = matches[1];
    var tail = matches[2];

    var branches = tail.split(path.sep);
    var normalized = branches.reduce(function (acc, branch) {
      if (!isSolidString(branch) || branch === '.') {
        return acc;
      } else if (branch === '..') {
        return acc.replace(/[^\\]+\\?$/, '');
      } else {
        return fso.BuildPath(acc, branch);
      }
    }, '');

    if (head !== '') normalized = head + path.sep + normalized;

    // Restore the last '\\' <- 2 characters!!
    // if (!endsWith(str, path.sep)) normalized += path.sep;

    return normalized;
  }; // }}}

  // path.join {{{
  /**
   * Joins all given path segments. Similar to {@link https://nodejs.org/api/path.html#path_path_join_paths|Node.js Path}.
   *
   * @example
var path = Wsh.Path;

path.join(['C:', 'Program Files (x86)', 'Microsoft.NET', 'RedistList', 'AssemblyList_4_client.xml']);
// Returns: 'C:\\Program Files (x86)\\Microsoft.NET\\RedistList\\AssemblyList_4_client.xml'

path.join(['C:\\Git\\', '\\mingw64\\', 'lib', '..\\etc', '.gitconfig']);
// Returns: 'C:\\Git\\mingw64\\etc\\.gitconfig''

path.join(['mingw64\\lib', '..\\etc', '.gitconfig']);
// Returns: 'mingw64\\etc\\.gitconfig'

path.join(['\\\\CompName', 'Public', 'photo3.jpg']);
// Returns: '\\\\CompName\\Public\\photo3.jpg'
   * @function join
   * @memberof Wsh.Path
   * @param {...string} arguments - Parts of the file path.
   * @returns {string} - The Joined patha
   */
  path.join = function (/* ...parts */) {
    var parts = Array.from(arguments);

    var pth = parts.shift();
    if (endsWith(pth, ':')) pth += path.sep;

    parts.forEach(function (part) {
      if (!isString(part)) throwErrNonStr('path.join', part);

      pth = fso.BuildPath(pth, part);
    });

    return path.normalize(pth);
  }; // }}}

  // path.resolve {{{
  /**
   * Resolves the sequence of paths or path segments into an absolute path. Similar to {@link https://nodejs.org/api/path.html#path_path_resolve_paths|Node.js Path}.
   *
   * @example
var path = Wsh.Path;

path.resolve('');
// Returns: <The current direcotry path>

path.resolve(['C:', 'Program Files (x86)', 'Microsoft.NET', 'RedistList', 'AssemblyList_4_client.xml']);
// Returns: 'C:\\Program Files (x86)\\Microsoft.NET\\RedistList\\AssemblyList_4_client.xml'

path.resolve(['C:\\Git\\', '\\mingw64\\', 'lib', '..\\etc', '.gitconfig']);
// Returns: 'C:\\Git\\mingw64\\etc\\.gitconfig'

path.resolve(['mingw64\\lib', '..\\etc', '.gitconfig']);
// Returns: '<Current Path>\\mingw64\\etc\\.gitconfig'

path.resolve(['\\\\CompName', 'Public', 'photo3.jpg']);
// Returns: '\\\\CompName\\Public\\photo3.jpg'

path.resolve.apply(['C:\\Git', 'D:\\bin\\git\\', '\\etc', '.gitconfig']);
// Returns: 'D:\\bin\\git\\etc\\.gitconfig'
   * @function resolve
   * @memberof Wsh.Path
   * @param {...string} arguments - Parts of the file path.
   * @returns {string} - The resolved path.
  */
  path.resolve = function (/* ...parts */) {
    var parts = Array.from(arguments);

    var pth = parts.shift();
    if (endsWith(pth, ':')) pth += path.sep;
    /**
     * Retrieve or change the current directory.
     *
     * @name CurrentDirectory
     * @type {string}
     * @memberof Wsh.Shell
     */
    if (!path.isAbsolute(pth)) pth = path.join(sh.CurrentDirectory, pth);

    parts.forEach(function (part) {
      if (!isString(part)) throwErrNonStr('path.resolve', part);

      if (/^[a-z]:/i.test(part)) {
        pth = part;
      } else {
        pth = fso.BuildPath(pth, part);
      }
    });

    return path.normalize(pth);
  }; // }}}

  // path.toUNC {{{
  /**
   * Convert the LFS (Local File System) path to UNC.
   *
   * @example
var path = Wsh.Path;

path.toUNC('//CompName');
// Returns: '//CompName'

path.toUNC('C:\\foo\\bar.baz');
// Returns: '\\\\<Your CompName>\\C$\\foo\\bar.baz'

// Unix-like (POSIX)
path.toUNC('C:/foo/bar.baz');
// Returns: '\\\\<Your CompName>\\C$\\foo\\bar.baz'

path.toUNC('');
// Returns: ''
   * @function toUNC
   * @memberof Wsh.Path
   * @param {string} str - The path to convert.
   * @returns {string} - The UNC path.
  */
  path.toUNC = function (str) {
    if (!isString(str)) throwErrNonStr('path.toUNC', str);
    if (str === '') return '';
    if (/^[/\\]{2}[^/\\]+/i.test(str)) return str;

    var network = WScript.CreateObject('WScript.Network');
    var compName = String(network.ComputerName);
    network = null;

    return path.resolve(str).replace(/^([a-z]):/i, '\\\\' + compName + '\\$1$');
  }; // }}}

  // path.relative {{{
  /**
   * Returns the relative path from fromDir to toPath. Similar to {@link https://nodejs.org/api/path.html#path_path_relative_from_to|Node.js Path}.
   *
   * @example
var path = Wsh.Path;
var pathA, pathB;

pathA = 'C:\\MyApps\\Gimp';
pathB = 'D:\\Apps\\ImageMagick\\convert.exe';
path.relative(pathA, pathB);
// Returns: 'D:\\Apps\\ImageMagick\\convert.exe'

pathA = 'C:\\MyApps';
pathB = 'C:\\MyApps\\convert.exe';
path.relative(pathA, pathB);
// Returns: 'convert.exe'

pathA = 'C:\\MyApps\\Paint\\Gimp';
pathB = 'C:\\MyApps\\Converter\\ImageMagick\\convert.exe';
path.relative(pathA, pathB);
// Returns: '..\\..\\Converter\\ImageMagick\\convert.exe'

pathA = 'C:\\MyApps\\Gimp';
pathB = 'C:\\ImageMagick\\convert.exe';
path.relative(pathA, pathB);
// Returns: '..\\..\\ImageMagick\\convert.exe'

pathA = 'C:\\MyApps\\Paint\\Gimp';
pathB = 'C:\\convert.exe';
path.relative(pathA, pathB);
// Returns: '..\\..\\..\\convert.exe'
   * @function relative
   * @memberof Wsh.Path
   * @param {string} fromDir - The start directory path.
   * @param {string} toPath - The end path.
   * @returns {string} - The relative path.
   */
  path.relative = function (fromDir, toPath) {
    if (!isString(fromDir)) throwErrNonStr('path.relative', fromDir);
    if (!isString(toPath)) throwErrNonStr('path.relative', toPath);

    if (fromDir === '' && toPath === '') return '';

    fromDir = path.resolve(fromDir);
    toPath = path.resolve(toPath);

    if (!isSameStr(path.parse(fromDir).root, path.parse(toPath).root)) {
      return toPath;
    }

    var fromNodes = fromDir.split(path.sep);
    var toNodes = toPath.split(path.sep);
    var rtnRelPath = toPath;
    var matchedNum = 0;

    for (var i = 0, I = fromNodes.length; i < I; i++) {
      if (isSameStr(fromNodes[i], toNodes[i])) {
        rtnRelPath = rtnRelPath.replace(toNodes[i] + path.sep, '');
        matchedNum++;
      } else {
        break;
      }
    }

    var restFrom = fromNodes.length - matchedNum;

    if (restFrom === 0) {
      rtnRelPath = '.' + path.sep + rtnRelPath;
    } else {
      var upNum = restFrom;
      while (upNum-- > 0) {
        rtnRelPath = '..' + path.sep + rtnRelPath;
      }
    }

    if (startsWith(rtnRelPath, '.' + path.sep)) { // Remove .\\
      return rtnRelPath.slice(('.' + path.sep).length);
    }
    return rtnRelPath;
  }; // }}}
})();

// vim:set foldmethod=marker commentstring=//%s :
