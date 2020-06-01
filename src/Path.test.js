/* globals Wsh: false */
/* globals __dirname: false */
/* globals __filename: false */

/* globals describe: false */
/* globals test: false */
/* globals expect: false */

// Shorthand
var path = Wsh.Path;

var _cb = function (fn/* , args */) {
  var args = Array.from(arguments).slice(1);
  return function () { fn.apply(null, args); };
};

describe('Path', function () {
  var fso = Wsh.FileSystemObject;
  if (!fso) fso = WScript.CreateObject('Scripting.FileSystemObject');

  var sh = Wsh.Shell;
  if (!sh) sh = WScript.CreateObject('WScript.Shell');

  var network = Wsh.Network;
  if (!network) network = WScript.CreateObject('WScript.Network');

  var noneStrVals = [true, false, undefined, null, 0, 1, NaN, Infinity, [], {}];

  test('Globals, Const Values', function () { // {{{
    expect(__filename).toBe(WScript.ScriptFullName);
    expect(__dirname).toBe(fso.GetParentFolderName(__filename));
    expect(path.delimiter).toBe(';');
    expect(path.sep).toBe('\\');
  }); // }}}

  test('isUNC', function () { // {{{
    var isUNC = path.isUNC;

    expect(isUNC('\\\\CompName')).toBe(false);
    expect(isUNC('\\\\CompName\\')).toBe(false);
    expect(isUNC('\\\\CompName\\SharedDir')).toBe(true);
    // Long UNC
    expect(isUNC('\\\\?\\UNC\\CompName\\SharedDir')).toBe(true);
    // LFS (Local File System)
    expect(isUNC('C:\\foo\\bar.baz')).toBe(false);
    // Unix-like (POSIX)
    expect(isUNC('//CompName//SharedDir')).toBe(false);
    expect(isUNC('C:/foo/bar.baz')).toBe(false);
    expect(isUNC('/C/foo/bar.baz')).toBe(false);

    expect(isUNC('')).toBe(false);

    noneStrVals.forEach(function (val) {
      expect(_cb(isUNC, val)).toThrowError();
    });
  }); // }}}

  test('dirname', function () { // {{{
    var pt = 'C:/foo/bar/baz/asdf/quux';
    expect(path.dirname(pt)).toBe('C:/foo/bar/baz/asdf');

    var pt01 = 'C:\\MyData\\image.jpg';
    expect(path.dirname(pt01)).toBe('C:\\MyData');

    expect(path.dirname('C:\\My Data')).toBe('C:\\');

    var pt02 = 'C:\\Program Files (x86)\\Microsoft.NET\\RedistList\\AssemblyList_4_client.xml';
    expect(path.dirname(pt02)).toBe('C:\\Program Files (x86)\\Microsoft.NET\\RedistList');

    var pt05 = 'D:\\Backup\\Apps\\';
    expect(path.dirname(pt05)).toBe('D:\\Backup');

    var pt06 = '\\\\CompName\\Public\\photo3.jpg';
    expect(path.dirname(pt06)).toBe('\\\\CompName\\Public\\');

    var pt07 = 'C/Git/mingw64/bin/git.exe';
    expect(path.dirname(pt07)).toBe('C/Git/mingw64/bin');

    var pt08 = 'C:\\Git\\mingw64\\lib\\..\\etc\\.gitconfig';
    expect(path.dirname(pt08)).toBe('C:\\Git\\mingw64\\lib\\..\\etc');

    var pt09 = '..\\.config\\settings.json';
    expect(path.dirname(pt09)).toBe('..\\.config');

    expect(path.dirname('settings.json')).toBe('.');

    // Imitate the behavior of Node.js path.dirname
    expect(path.dirname('C:')).toBe('C:');
    expect(path.dirname('C:\\')).toBe('C:\\');
    expect(path.dirname('')).toBe('.');
    expect(path.dirname('Hoge')).toBe('.');
    expect(path.dirname('\\\\CompName\\Public')).toBe('\\\\CompName\\Public');
    expect(path.dirname('\\\\CompName\\')).toBe('\\');
    expect(path.dirname('\\\\CompName')).toBe('\\');

    noneStrVals.forEach(function (val) {
      expect(_cb(path.dirname, val)).toThrowError();
    });
  }); // }}}

  test('basename', function () { // {{{
    var fpA = 'C:\\foo\\bar\\baz\\quux.html';
    expect(path.basename(fpA)).toBe('quux.html');
    expect(path.basename(fpA, '.html')).toBe('quux');

    expect(path.basename('C:\\My Data')).toBe('My Data');
    expect(path.basename('C:\\temp.log', 'log')).toBe('temp.');
    expect(path.basename('C:\\my-repo\\.gitignore')).toBe('.gitignore');
    expect(path.basename('\\\\CompName\\Public\\photo3.jpg')).toBe('photo3.jpg');
    expect(path.basename('C:\\')).toBe('');
    expect(path.basename('C:')).toBe('');
    expect(path.basename('')).toBe('');
    expect(path.basename('Hoge')).toBe('Hoge');
    // Imitate the behavior of Node.js path.basename
    expect(path.basename('C:\\my-repo\\.gitignore', '.gitignore')).toBe('.gitignore');
    expect(path.basename('\\\\CompName\\Public')).toBe('Public');
    expect(path.basename('\\\\CompName\\')).toBe('CompName');
    expect(path.basename('\\\\CompName')).toBe('CompName');

    noneStrVals.forEach(function (val) {
      expect(_cb(path.basename, val)).toThrowError();
    });
  }); // }}}

  test('extname', function () { // {{{
    expect(path.extname('index.html')).toBe('.html');
    expect(path.extname('index.coffee.md')).toBe('.md');
    expect(path.extname('index.')).toBe('.');
    expect(path.extname('index')).toBe('');
    expect(path.extname('.index')).toBe('');
    expect(path.extname('.index.md')).toBe('.md');

    expect(path.extname('C:\\foo\\bar\\baz\\quux.html')).toBe('.html');
    expect(path.extname('C:\\My Data')).toBe('');
    expect(path.extname('C:\\my-repo\\.gitignore')).toBe('');
    expect(path.extname('\\\\CompName\\Public\\photo3.jpg')).toBe('.jpg');
    expect(path.extname('C:\\')).toBe('');
    expect(path.extname('C:')).toBe('');
    expect(path.extname('')).toBe('');
    expect(path.extname('Hoge')).toBe('');
    expect(path.extname('C:\\my-repo\\.gitignore')).toBe('');
    expect(path.extname('\\\\CompName\\Public')).toBe('');
    expect(path.extname('\\\\CompName\\')).toBe('');
    expect(path.extname('\\\\CompName')).toBe('');

    noneStrVals.forEach(function (val) {
      expect(_cb(path.extname, val)).toThrowError();
    });
  }); // }}}

  test('parse', function () { // {{{
    expect(path.parse('C:\\home\\user\\dir\\file.txt')).toEqual({
      root: 'C:\\',
      dir: 'C:\\home\\user\\dir',
      base: 'file.txt',
      ext: '.txt',
      name: 'file' });
    expect(path.parse('\\\\CompName\\Public\\photo3.jpg')).toEqual({
      root: '\\\\CompName\\Public\\',
      dir: '\\\\CompName\\Public\\',
      base: 'photo3.jpg',
      ext: '.jpg',
      name: 'photo3' });
    expect(path.parse('C:\\.git')).toEqual({
      root: 'C:\\', dir: 'C:\\', base: '.git', ext: '', name: '.git' });
    expect(path.parse('C:\\')).toEqual({
      root: 'C:\\', dir: 'C:\\', base: '', ext: '', name: '' });
    expect(path.parse('C:')).toEqual({
      root: 'C:', dir: 'C:', base: '', ext: '', name: '' });

    // Slash Spliting
    expect(path.parse('C:/home/user/dir/file.txt')).toEqual({
      root: 'C:/',
      dir: 'C:/home/user/dir',
      base: 'file.txt',
      ext: '.txt',
      name: 'file' });

    noneStrVals.forEach(function (val) {
      expect(_cb(path.parse, val)).toThrowError();
    });
  }); // }}}

  test('isAbsolute', function () { // {{{
    expect(path.isAbsolute('C:\\My Data\\hoge.png')).toBe(true);
    expect(path.isAbsolute('C:\\My Data\\..')).toBe(true);
    expect(path.isAbsolute('bar\\baz')).toBe(false);
    expect(path.isAbsolute('.')).toBe(false);
    // UNC
    expect(path.isAbsolute('\\\\CompName')).toBe(true);
    // Unix-like (POSIX)
    expect(path.isAbsolute('C:/My Data/hoge.png')).toBe(true);
    expect(path.isAbsolute('C:/My Data/..')).toBe(true);
    expect(path.isAbsolute('//CompName')).toBe(true);
    expect(path.isAbsolute('bar/baz')).toBe(false);

    noneStrVals.forEach(function (val) {
      expect(_cb(path.isAbsolute, val)).toThrowError();
    });
  }); // }}}

  test('normalize', function () { // {{{
    expect(path.normalize('C:\\temp\\\\foo\\bar\\..\\')).toBe('C:\\temp\\foo\\');
    expect(path.normalize('C:////temp\\\\/\\/\\/foo/bar')).toBe('C:\\temp\\foo\\bar');

    // @note bash.exe は/C/～がC:\を意味するが、それは解釈しない
    var pt07 = 'C/Git/mingw64/bin/git.exe';
    expect(path.normalize(pt07)).toBe('C\\Git\\mingw64\\bin\\git.exe');

    var pt08 = 'C:\\Git\\mingw64\\lib\\..\\etc\\.gitconfig';
    expect(path.normalize(pt08)).toBe('C:\\Git\\mingw64\\etc\\.gitconfig');

    var pt09 = '..\\.config\\settings.json';
    expect(path.normalize(pt09)).toBe('..\\.config\\settings.json');

    expect(path.normalize('settings.json')).toBe('settings.json');

    noneStrVals.forEach(function (val) {
      expect(_cb(path.normalize, val)).toThrowError();
    });
  }); // }}}

  test('join', function () { // {{{
    var args01 = ['C:', 'Program Files (x86)', 'Microsoft.NET', 'RedistList', 'AssemblyList_4_client.xml'];
    expect(path.join.apply(null, args01)).toBe('C:\\Program Files (x86)\\Microsoft.NET\\RedistList\\AssemblyList_4_client.xml');

    var args02 = ['C:\\Git\\', '\\mingw64\\', 'lib', '..\\etc', '.gitconfig'];
    expect(path.join.apply(null, args02)).toBe('C:\\Git\\mingw64\\etc\\.gitconfig');

    var args03 = ['mingw64\\lib', '..\\etc', '.gitconfig'];
    expect(path.join.apply(null, args03)).toBe('mingw64\\etc\\.gitconfig');

    var args04 = ['\\\\CompName', 'Public', 'photo3.jpg'];
    expect(path.join.apply(null, args04)).toBe('\\\\CompName\\Public\\photo3.jpg');

    expect(path.join('')).toBe('.');

    noneStrVals.forEach(function (val) {
      expect(_cb(path.join, val)).toThrowError();
    });
  }); // }}}

  test('resolve', function () { // {{{
    expect(path.resolve('')).toBe(sh.CurrentDirectory);

    var args01 = ['C:', 'Program Files (x86)', 'Microsoft.NET', 'RedistList', 'AssemblyList_4_client.xml'];
    expect(path.resolve.apply(null, args01))
        .toBe('C:\\Program Files (x86)\\Microsoft.NET\\RedistList\\AssemblyList_4_client.xml');

    var args02 = ['C:\\Git\\', '\\mingw64\\', 'lib', '..\\etc', '.gitconfig'];
    expect(path.resolve.apply(null, args02))
        .toBe('C:\\Git\\mingw64\\etc\\.gitconfig');

    var args03 = ['mingw64\\lib', '..\\etc', '.gitconfig'];
    expect(path.resolve.apply(null, args03))
        .toBe(path.join(sh.CurrentDirectory, 'mingw64\\etc\\.gitconfig'));

    var args04 = ['\\\\CompName', 'Public', 'photo3.jpg'];
    expect(path.resolve.apply(null, args04))
        .toBe('\\\\CompName\\Public\\photo3.jpg');

    var args05 = ['C:\\Git', 'D:\\bin\\git\\', '\\etc', '.gitconfig'];
    expect(path.resolve.apply(null, args05))
        .toBe('D:\\bin\\git\\etc\\.gitconfig');

    noneStrVals.forEach(function (val) {
      expect(_cb(path.resolve, val)).toThrowError();
    });
  }); // }}}

  test('relative', function () { // {{{
    var path1A = 'C:\\MyApps\\Gimp';
    var path1B = 'D:\\Apps\\ImageMagick\\convert.exe';
    expect(path.relative(path1A, path1B)).toBe(path1B);

    var path2A = 'C:\\MyApps';
    var path2B = 'C:\\MyApps\\convert.exe';
    expect(path.relative(path2A, path2B)).toBe('convert.exe');

    var path3A = 'C:\\MyApps\\Paint\\Gimp';
    var path3B = 'C:\\MyApps\\Converter\\ImageMagick\\convert.exe';
    expect(path.relative(path3A, path3B))
        .toBe('..\\..\\Converter\\ImageMagick\\convert.exe');

    var path4A = 'C:\\MyApps\\Gimp';
    var path4B = 'C:\\ImageMagick\\convert.exe';
    expect(path.relative(path4A, path4B))
        .toBe('..\\..\\ImageMagick\\convert.exe');

    var path5A = 'C:\\MyApps\\Paint\\Gimp';
    var path5B = 'C:\\convert.exe';
    expect(path.relative(path5A, path5B)).toBe('..\\..\\..\\convert.exe');

    expect(path.relative('', '')).toBe('');

    noneStrVals.forEach(function (val) {
      expect(_cb(path.relative, val)).toThrowError();
    });
  }); // }}}

  test('toUNC', function () { // {{{
    var compName = String(network.ComputerName);

    expect(path.toUNC('//CompName')).toBe('//CompName');
    expect(path.toUNC('\\\\CompName')).toBe('\\\\CompName');
    expect(path.toUNC('C:\\foo\\bar.baz'))
        .toBe('\\\\' + compName + '\\C$\\foo\\bar.baz');
    expect(path.toUNC('C:/foo/bar.baz'))
        .toBe('\\\\' + compName + '\\C$\\foo\\bar.baz');
    expect(path.toUNC('')).toBe('');

    noneStrVals.forEach(function (val) {
      expect(_cb(path.toUNC, val)).toThrowError();
    });
  }); // }}}
});

