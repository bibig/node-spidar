// mocha -R spec test/test.js

var should = require('should');
var assert = require('assert');
var tools = require('../tools');
var fs = require('fs');


describe('tools unit test', function () {
	it('get path ext', function () {
		assert.ok(tools.urlExt('http://xxx.com/waiguo/lubinxunpiaoliuji/index.htm') == 'htm');
		assert.ok(tools.urlExt('/waiguo/lubinxunpiaoliuji/index.HTML') == 'html');
		assert.ok(tools.urlExt('/waiguo/lubinxunpiaoliuji/') == 'html');
		assert.ok(tools.urlExt('/waiguo/lubinxunpiaoliuji') == 'html');
	});
	
	it('isExternal test', function () {
		assert.ok(tools.isExternal('http://www.123.com/blablabla', 'http://www.abc.com/'));
		assert.ok(!tools.isExternal('http://www.abc.com/blablabla', 'http://www.abc.com/'));
		assert.ok(!tools.isExternal('blablabla', 'http://www.abc.com/'));
	});
	
	it('test absolutePath', function () {
		assert.ok(tools.absolutePath('/waiguo2005/s/shashibiya/../../../wangluo2005/chongqinggunanguanv/index.htm') == '/wangluo2005/chongqinggunanguanv/index.htm');
		assert.ok(tools.absolutePath('/abc/../123') == '/123');
		assert.ok(tools.absolutePath('/abcd/../../123') == '/123');
		assert.ok(tools.absolutePath('/aaa/bbb/abcd/../../123') == '/aaa/123');
		assert.ok(tools.absolutePath('/aaa/bbb/abcd/../../123.html') == '/aaa/123.html');
	});
	
	it('test urlLayers', function () {
		assert.ok(tools.urlLayers('http://www.abc.com') == 0);
		assert.ok(tools.urlLayers('http://www.abc.com/') == 0);
		assert.ok(tools.urlLayers('http://www.abc.com/pc') == 1);
		assert.ok(tools.urlLayers('http://www.abc.com/pc.html') == 1);
		assert.ok(tools.urlLayers('http://www.abc.com/pc/adf.html') == 2);
		assert.ok(tools.urlLayers('http://www.abc.com/pc/adf/bb') == 3);
	});
	
	it('test urlEncoded', function () {
		assert.ok(tools.urlEncoded('http://www.abc.com/') == 'http://www.abc.com/');
		assert.ok(tools.urlEncoded('http://www.abc.com/pc/abc.html') == 'http://www.abc.com/pc/abc.html');
		assert.ok(tools.urlEncoded('http://www.abc.com/pc') == 'http://www.abc.com/pc');
		assert.ok(tools.urlEncoded('http://www.abc.com/pc/中文.html') == 'http://www.abc.com/pc/' +  encodeURIComponent('中文') + '.html');
	});
	
	it('test localPath', function () {
		tools.localPath('/', 'http://www.abc.com/', 'htm').should.eql('/www.abc.com/index.htm');
		tools.localPath('/', 'http://www.abc.com', 'htm').should.eql('/www.abc.com/index.htm');
		tools.localPath('/', 'http://www.abc.com/a/b/c', 'htm').should.eql('/www.abc.com/a/b/c');
		tools.localPath('/', 'http://www.abc.com/a/b/c.html', 'htm').should.eql('/www.abc.com/a/b/c.html');
		tools.localPath('site/', 'http://www.abc.com/a/b/', 'htm').should.eql('site/www.abc.com/a/b/index.htm');
	});
	
	if ('test cleanHtml', function () {
	  var html = "<html><head>\n<title> im title\n</title><meta";
	  tools.cleanHtml(html).should.eql('<html><head><title> im title</title><meta');
	});
	
	it ('test parseTitle', function () {
		var html = "<html><head>\n<title> im title\n</title><meta";
		tools.parseTitle(tools.cleanHtml(html)).should.eql('im title');
	});
	
	it ('test stripKeywords', function () {
		var html = 'hello<a target="_blank" href="http://union.dangdang.com/transfer.php?sys_id=1&amp;ad_type=10&amp;from=P-296581&amp;backurl=http%3A%2F%2Fproduct.dangdang.com%2Fproduct.aspx%3Fproduct_id%3D22484707"><font color="#dc143c" size="4"><strong>去当当购买：《史蒂夫乔布斯传》普通版</strong></font></a> <a target="_blank" href="http://union.dangdang.com/transfer.php?sys_id=1&amp;ad_type=10&amp;from=P-296581&amp;backurl=http%3A%2F%2Fproduct.dangdang.com%2Fproduct.aspx%3Fproduct_id%3D22533235"><font color="#dc143c" size="4"><strong>《史蒂夫乔布斯传》精装版</strong></font></a>world';
		// console.log(tools.stripKeywords(html, 'dangdang.com', '<a', '</a>'));
		assert.ok(tools.stripKeywords(html, 'dangdang.com', '<a', '</a>') == 'hello world');
		
		html = '<html><tag><keywords></tag>a<tag><keywords></tag>b<tag><keywords></tag>c<tag><keywords></tag>d</html>';
		assert.ok(tools.stripKeywords(html, 'keywords', '<tag>', '</tag>') == '<html>abcd</html>');
	});

});