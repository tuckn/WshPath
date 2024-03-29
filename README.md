# WshPath

Adds useful functions (similar to Node.js path) that handle file path strings into WSH (Windows Script Host).

## tuckn/Wsh series dependency

[WshModeJs](https://github.com/tuckn/WshModeJs)  
└─ [WshZLIB](https://github.com/tuckn/WshZLIB)  
&emsp;└─ [WshNet](https://github.com/tuckn/WshNet)  
&emsp;&emsp;└─ [WshChildProcess](https://github.com/tuckn/WshChildProcess)  
&emsp;&emsp;&emsp;└─ [WshProcess](https://github.com/tuckn/WshProcess)  
&emsp;&emsp;&emsp;&emsp;&emsp;└─ [WshFileSystem](https://github.com/tuckn/WshFileSystem)  
&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;└─ [WshOS](https://github.com/tuckn/WshOS)  
&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;└─ WshPath - This repository  
&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;└─ [WshUtil](https://github.com/tuckn/WshUtil)  
&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;└─ [WshPolyfill](https://github.com/tuckn/WshPolyfill)

The upper layer module can use all the functions of the lower layer module.

## Operating environment

Works on JScript in Windows.

## Installation

(1) Create a directory of your WSH project.

```console
D:\> mkdir MyWshProject
D:\> cd MyWshProject
```

(2) Download this ZIP and unzip or Use the following `git` command.

```console
> git clone https://github.com/tuckn/WshPath.git ./WshModules/WshPath
or
> git submodule add https://github.com/tuckn/WshPath.git ./WshModules/WshPath
```

(3) Create your JScript (.js) file. For Example,

```console
D:\MyWshProject\
├─ MyScript.js <- Your JScript code will be written in this.
└─ WshModules\
    └─ WshPath\
        └─ dist\
          └─ bundle.js
```

I recommend JScript (.js) file encoding to be UTF-8 [BOM, CRLF].

(4) Create your WSF packaging scripts file (.wsf).

```console
D:\MyWshProject\
├─ Run.wsf <- WSH entry file
├─ MyScript.js
└─ WshModules\
    └─ WshPath\
        └─ dist\
          └─ bundle.js
```

And you should include _.../dist/bundle.js_ into the WSF file.
For Example, The content of the above _Run.wsf_ is

```xml
<package>
  <job id = "run">
    <script language="JScript" src="./WshModules/WshPath/dist/bundle.js"></script>
    <script language="JScript" src="./MyScript.js"></script>
  </job>
</package>
```

I recommend this WSH file (.wsf) encoding to be UTF-8 [BOM, CRLF].

Awesome! This WSH configuration allows you to use the following functions in JScript (_.\\MyScript.js_).

## Usage

Now your JScript (_.\\MyScript.js_ ) can use helper functions to handle paths.
For example,

```js
var path = Wsh.Path; // Shorthand

console.log(__filename); // "D:\MyWshProject\Run.wsf"
console.log(__dirname); // "D:\MyWshProject"
console.log(path.delimiter); // ';"
console.log(path.sep); // "\"

path.dirname('C:\\My Data\\image.jpg'); // 'C:\\My Data'
path.basename('C:\\foo\\bar\\baz\\quux.html'); // 'quux.html'
path.extname('index.coffee.md'); // '.md'

path.parse('C:\\home\\user\\dir\\file.txt');
// Returns:
// { root: 'C:\\',
//   dir: 'C:\\home\\user\\dir',
//   base: 'file.txt',
//   ext: '.txt',
//   name: 'file' };

path.isAbsolute('C:\\My Data\\hoge.png'); // true
path.isAbsolute('bar\\baz'); // false
path.isAbsolute('.'); // false

path.normalize('C:\\Git\\mingw64\\lib\\..\\etc\\.gitconfig');
// Returns: 'C:\\Git\\mingw64\\etc\\.gitconfig'

path.join('mingw64\\lib', '..\\etc', '.gitconfig');
// Returns: 'mingw64\\etc\\.gitconfig'

path.resolve('mingw64\\lib', '..\\etc', '.gitconfig');
// Returns: '<Current Working Directory>\\mingw64\\etc\\.gitconfig'

path.isUNC('C:\\foo\\bar.baz'); // false
path.isUNC('\\\\CompName\\'); // false
path.isUNC('\\\\CompName\\SharedDir'); // true
path.isUNC('//CompName//SharedDir'); // false

path.toUNC('C:\\foo\\bar.baz');
// Returns: '\\\\<Your CompName>\\C$\\foo\\bar.baz'

var from = 'C:\\MyApps\\Paint\\Gimp';
var to = 'C:\\MyApps\\Converter\\ImageMagick\\convert.exe';
path.relative(from, to);
// Returns: '..\\..\\Converter\\ImageMagick\\convert.exe'
```

Many other functions will be added.
See the [documentation](https://tuckn.net/docs/WshPath/) for more details.

### Dependency Modules

You can also use the following helper functions in your JScript (_.\\MyScript.js_).

- [tuckn/WshPolyfill](https://github.com/tuckn/WshPolyfill)
- [tuckn/WshUtil](https://github.com/tuckn/WshUtil)

## Documentation

See all specifications [here](https://tuckn.net/docs/WshPath/) and also below.

- [WshPolyfill](https://tuckn.net/docs/WshPolyfill/)
- [WshUtil](https://tuckn.net/docs/WshUtil/)

## License

MIT

Copyright (c) 2020 [Tuckn](https://github.com/tuckn)
