exports.toUTF8 = toUTF8;
exports.trim = trim;
exports.stripTags = stripTags;
exports.stripKeywords = stripKeywords;
exports.urlCleaned = urlCleaned;
exports.urlEncoded = urlEncoded;
exports.urlLayers = urlLayers;
exports.urlFile = urlFile;
exports.urlParent = urlParent;
exports.fileExt = fileExt;
exports.urlExt = urlExt;
exports.absolutePath = absolutePath;
exports.isExternal = isExternal;
exports.parseResources = parseResources;
exports.parseTitle = parseTitle;
exports.localPath = localPath;
exports.uniqueUrl = uniqueUrl;
exports.cleanHtml = cleanHtml;

var URL = require('url');
var _ = require('lodash');

/**
 * parse all urls from html string
 */
 
function parseResources (html, from, defaultHtmlExt) {
	if ( ! html ) return [];
	
	var match;
	var list = [];
	//var re = /[\s]+src=["']?([\w\d\-\/\._]+)["']?[\s]+/gi;
	var re = /(src|href)=["']?([^'"\s]+)["']?/gi;
	
	while(match = re.exec(html)) {
		var url = match[2];
		if (!url) continue;
		if (url == '#') continue;
		list.push(url);
	}
	
	return _.uniq(list);
}

function parseTitle (html) {
	if ( ! html ) return '';
	
	var re = /<title>(.*?)<\/title>/gi;
	var match = re.exec(html) || [];
	var title = match[1] || '';
	console.log(match);
	title = title.replace(/[\n\b\r\t]+/g, '');
	
	return trim(title);
}

function cleanHtml (html) {
  return html.replace(/[\n\b\r\t]+/g, '').replace(/[ ]+/g, ' ');
}

/**
 * get rid of the hash, query parts in url
 */
function urlCleaned (url) {
	var info = URL.parse(getAbsolutePath(url));
	return info.protocol + '//' + info.host + info.pathname;
}

// GBK是GB2312的扩展，即GB2312是GBK的子集
// 默认charset是GBK
function toUTF8 (body, charset) {
	var Iconv = require('iconv').Iconv;
	body = new Buffer(body, 'binary');
	charset = charset || 'GBK';
	return new Iconv(charset, 'UTF-8//TRANSLIT//IGNORE').convert(body).toString();
}

// http://phpjs.org/functions/strip_tags/
// https://github.com/kvz/phpjs/blob/master/functions/strings/strip_tags.js
function stripTags (input, allowed) {
  // http://kevin.vanzonneveld.net
  // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   improved by: Luke Godfrey
  // +      input by: Pul
  // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   bugfixed by: Onno Marsman
  // +      input by: Alex
  // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +      input by: Marc Palau
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +      input by: Brett Zamir (http://brett-zamir.me)
  // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   bugfixed by: Eric Nagel
  // +      input by: Bobby Drake
  // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   bugfixed by: Tomasz Wesolowski
  // +      input by: Evertjan Garretsen
  // +    revised by: Rafał Kukawski (http://blog.kukawski.pl/)
  // *     example 1: strip_tags('<p>Kevin</p> <br /><b>van</b> <i>Zonneveld</i>', '<i><b>');
  // *     returns 1: 'Kevin <b>van</b> <i>Zonneveld</i>'
  // *     example 2: strip_tags('<p>Kevin <img src="someimage.png" onmouseover="someFunction()">van <i>Zonneveld</i></p>', '<p>');
  // *     returns 2: '<p>Kevin van Zonneveld</p>'
  // *     example 3: strip_tags("<a href='http://kevin.vanzonneveld.net'>Kevin van Zonneveld</a>", "<a>");
  // *     returns 3: '<a href='http://kevin.vanzonneveld.net'>Kevin van Zonneveld</a>'
  // *     example 4: strip_tags('1 < 5 5 > 1');
  // *     returns 4: '1 < 5 5 > 1'
  // *     example 5: strip_tags('1 <br/> 1');
  // *     returns 5: '1  1'
  // *     example 6: strip_tags('1 <br/> 1', '<br>');
  // *     returns 6: '1  1'
  // *     example 7: strip_tags('1 <br/> 1', '<br><br/>');
  // *     returns 7: '1 <br/> 1'
  allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
  var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
    commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
  return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
    return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
  });
}

function stripKeywords (html, keywords, beginTag, endTag) {
	var _strip = function (html, keywords, beginTag, endTag) {
		var pos = html.indexOf(keywords);
		var from, to;
		if (pos == -1) { return html;}
		
		from = html.substring(0, pos).lastIndexOf(beginTag);
		to = html.indexOf(endTag, pos);
		
		return html.substring(0, from) + html.substring(to + endTag.length);
	}

	while(html.indexOf(keywords) > -1) {
		html = _strip(html, keywords, beginTag, endTag);
	}
	return html;
}

// https://github.com/kvz/phpjs/blob/master/functions/strings/trim.js
function trim (str, charlist) {
  // http://kevin.vanzonneveld.net
  // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   improved by: mdsjack (http://www.mdsjack.bo.it)
  // +   improved by: Alexander Ermolaev (http://snippets.dzone.com/user/AlexanderErmolaev)
  // +      input by: Erkekjetter
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +      input by: DxGx
  // +   improved by: Steven Levithan (http://blog.stevenlevithan.com)
  // +    tweaked by: Jack
  // +   bugfixed by: Onno Marsman
  // *     example 1: trim('    Kevin van Zonneveld    ');
  // *     returns 1: 'Kevin van Zonneveld'
  // *     example 2: trim('Hello World', 'Hdle');
  // *     returns 2: 'o Wor'
  // *     example 3: trim(16, 1);
  // *     returns 3: 6
  var whitespace, l = 0,
    i = 0;
  str += '';

  if (!charlist) {
    // default list
    whitespace = " \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000";
  } else {
    // preg_quote custom list
    charlist += '';
    whitespace = charlist.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '$1');
  }

  l = str.length;
  for (i = 0; i < l; i++) {
    if (whitespace.indexOf(str.charAt(i)) === -1) {
      str = str.substring(i);
      break;
    }
  }

  l = str.length;
  for (i = l - 1; i >= 0; i--) {
    if (whitespace.indexOf(str.charAt(i)) === -1) {
      str = str.substring(0, i + 1);
      break;
    }
  }

  return whitespace.indexOf(str.charAt(0)) === -1 ? str : '';
}


/*
 * 将给定资源链接的每一级目录进行encodeURIComponent处理
 * anchor里面的url没有encode, 导致http.request获取失败，如<a href="/xx/yy/中文.html">xxx</a>
 */
function urlEncoded (url) {
	var info = URL.parse(url);
	var paths = info.pathname.substring(1).split('/');
	var encoded = [];
	paths.forEach(function (part) {
		encoded.push(encodeURIComponent(part));
	});
	
	return URL.resolve(info.href, '/' + encoded.join('/'));
}

/**
 * 给出path层级数
 * /xx/index.html -> 1
 * /xx/yy/index.html -> 2
 * /xx/yy/dd/index.html -> 3
 */
 
function urlLayers (url) {
	var info = URL.parse(url);
	var path = info.pathname;
	if (path == '/') return 0; // root
	return path.substring(1).split('/').length;
}

/**
 * 返回链接所指向的文件名
 * eg: 
 *    http://example.com/xxx/yyy -> index.html
 *		http://example.com/xxx/yyy/ -> index.html
 *		http://example.com/xxx/yyy/hello.html -> hello.html
 */

function urlFile (url, defaultFile) {
	var info = URL.parse(url.toLowerCase());
	var pathname = info['pathname'];
	var pos = pathname.lastIndexOf('/');
	var name = pos > -1 ? pathname.substring(pathname.lastIndexOf('/') + 1) : '';
	if (name.indexOf('.') == -1) {
	  return defaultFile || 'index.html';
	} else {
	  return name;
	}
}

/**
 * 获取文件扩展名
 */
 
function fileExt (file) {
	var lastDot = file.lastIndexOf('.');
	if (lastDot > -1) {
		return file.substring(lastDot + 1).toLowerCase();
	} else {
		return '';
	}
}

function urlExt (url, defaultFile) {
  console.log(urlFile(url, defaultFile));
	return fileExt(urlFile(url, defaultFile));
}

/**
 *  获取逻辑上的父路径
 *  @url: http://book.kanunu.org/book3/6878/131756.html
 *  return /book3/6878/
 */
 
function urlParent (url) {
	var path = URL.parse(url).pathname;
	var pos = path.lastIndexOf('/') + 1;
	return path.substring(0, pos);
}

/**
 * 考虑因对这种情况: /waiguo2005/s/shashibiya/../../../wangluo2005/chongqinggunanguanv/index.htm
 * 否则可能增加大量无谓劳动
 */
 
function absolutePath (path) {
	if (path.indexOf('/..') ==  -1) return path;
	var ab = [];
	var folders = path.substring(1).split('/');
	folders.forEach(function (f) {
		if (f == '..') {
			ab.pop();
		} else {
			ab.push(f);
		}
	});
	return '/' + ab.join('/');
}

/**
 * 将url唯一化
 * 比如： http://example.com/xx/yy/ -> http://example.com/xx/yy/index.html
 */
 
function uniqueUrl (url, ext) {
	// console.log('******DEFAULT_HTML_EXT:' + ext + ', url:' + url);
	if (url[url.length-1] == '/') {
		ext = ext || 'html';
		url += 'index.' + ext; 
	}
	return url;
}

/**
 * 获取本地对应与资源的地址，即将服务端的目录结构完整地复制到本地
 */
function localPath(localSiteRoot, url, ext) {
	var info = URL.parse(url);
	var file = info.hostname + info.pathname;
	var abFile = localSiteRoot + '/' + uniqueUrl(file, ext);
	return abFile.replace(/\/\//g, '/');
}

/**
 * 判断是否是外链
 */
 
function isExternal (url, from) {
	var parentInfo = URL.parse(from);
	var urlInfo = URL.parse(URL.resolve(from, url));
	return (parentInfo.host != urlInfo.host);
}