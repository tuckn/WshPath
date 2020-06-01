# WSH: Path

Adds some useful functions (similar to Node.js path) that handles file path strings in WSH (Windows Script Host).

## Operating environment

Works on JScript in Windows.

## Installation

(1) Create a directory of your WSH project.

```console
D:\> mkdir MyWshProject
D:\> cd MyWshProject
```

(2) Download this ZIP and unzipping or Use bellowing `git` command.

```console
> git clone https://github.com/tuckn/WshPath.git ./WshModules/WshPath
or
> git submodule add https://github.com/tuckn/WshPath.git ./WshModules/WshPath
```

(3) Include _.\WshPath\dist\bundle.js_ into your .wsf file.
For Example, if your file structure is

```console
D:\MyWshProject\
├─ Run.wsf
├─ MyScript.js
└─ WshModules\
    └─ WshPath\
        └─ dist\
          └─ bundle.js
```

The content of above _Run.wsf_ is

```xml
<package>
  <job id = "run">
    <script language="JScript" src="./WshModules/WshPath/dist/bundle.js"></script>
    <script language="JScript" src="./MyScript.js"></script>
  </job>
</package>
```

I recommend this .wsf file encoding to be UTF-8 [BOM, CRLF].
This allows the following functions to be used in _.\MyScript.js_.

## Usage

Now _.\MyScript.js_ (JScript ) can use the useful functions to handle paths.
for example,

```js
var path = Wsh.Path; // Shorthand

console.log(__filename); // 'D:\MyWshProject\Run.wsf'
console.log(__dirname); // 'D:\MyWshProject'
console.log(path.delimiter); // ';'
console.log(path.sep); // '\'

path.isUNC('C:\\foo\\bar.baz'); // false
path.isUNC('\\\\CompName\\'); // false
path.isUNC('\\\\CompName\\SharedDir'); // true
path.isUNC('//CompName//SharedDir'); // false

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

path.join(['mingw64\\lib', '..\\etc', '.gitconfig']);
// Returns: 'mingw64\\etc\\.gitconfig'

path.resolve(['mingw64\\lib', '..\\etc', '.gitconfig']);
// Returns: '<Current Working Directory>\\mingw64\\etc\\.gitconfig'

path.toUNC('C:\\foo\\bar.baz');
// Returns: '\\\\<Your CompName>\\C$\\foo\\bar.baz'

var from = 'C:\\MyApps\\Paint\\Gimp';
var to = 'C:\\MyApps\\Converter\\ImageMagick\\convert.exe';
path.relative(from, to);
// Returns: '..\\..\\Converter\\ImageMagick\\convert.exe'
```

Many other functions are added.
See the [documentation](https://docs.tuckn.net/WshPath) for more details.

And you can also use all [WshPolyfill](https://github.com/tuckn/WshPolyfill) functions and all [WshUtil](https://github.com/tuckn/WshUtil) functions.
for example,

### WshPolyfill

```js
var array1 = [1, 4, 9, 16];
var map1 = array1.map(function(x) {
  return x * 2;
});

console.dir(map1);
// Output: [2, 8, 18, 32]

var strJson = JSON.stringify({ from: array1, to: map1 });
console.log(strJson);
// Output: '{"from":[1,4,9,16],"to":[2,8,18,32]}'

// and so on...
```

### WshUtil

```js
var _ = Wsh.Util; // Shorthand

// Check deep strict equality
_.isEqual({ a: 'A', b: ['B'] }, { a: 'A', b: ['B'] }); // true
_.isEqual({ a: 'A', b: ['B'] }, { a: 'A', b: ['b'] }); // false

// Create a unique ID
_.uuidv4(); // '9f1e53ba-3f08-4c9d-91c7-ad4226312f40'

// Create a date string
_.createDateString(); // '20200528T065424+0900'
_.createDateString('yyyy-MM'); // '2020-05'

// 半角カナを全角に変換
_.toZenkakuKana('もぅﾏﾁﾞ無理。'); // 'もぅマヂ無理'

// and so on...
```

## Documentation

See all specifications [here](https://docs.tuckn.net/WshPath) and also below.

- [WshPolyfill](https://docs.tuckn.net/WshPolyfill)
- [WshUtil](https://docs.tuckn.net/WshUtil).

## License

MIT

Copyright (c) 2020 [Tuckn](https://github.com/tuckn)
