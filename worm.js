
'use strict';
var http       = require('http');
var fs         = require('fs');
var iconv      = require('iconv-lite');
var cheerio    = require('cheerio');

var DEMAND_URL = 'http://www.mm131.com/xinggan/';
var IMG_URL    = 'http://img1.mm131.com/pic/';
var LOCAL_DIR  = './images/';

getIndex(DEMAND_URL);

function getIndex(indeUrl){
  getWebSource(indeUrl, function (data){
    var content = data;
    var html    = iconv.decode(content, 'gb2312')
    var $       = cheerio.load(html);
    $('.main > dl > dd img').each(function (){
        var src    = $(this).attr('src');
        var href   = $(this).parent().attr('href');
        var name   = href.match('[^=/]\\w*\\.html\\w*')[0];
        var subDir = name.replace(/.html/, '');
        makeImgDir(subDir);
        getPageNum(indeUrl + subDir + '.html', subDir);
    })
  })
}

function sleep(milliSeconds) {
    var startTime = new Date().getTime();
    while (new Date().getTime() < startTime + milliSeconds);
}

function makeImgDir(subDir){
  if (!fs.existsSync(LOCAL_DIR + '/' + subDir)) {
     fs.mkdirSync(LOCAL_DIR + subDir);
     console.log(LOCAL_DIR + subDir + '目录创建成功');
  }
}

function getPageNum(subUrl,subDir){
  getWebSource(subUrl, function (data){
    var content     = data;
    var html        = iconv.decode(content, 'gb2312')
    var $           = cheerio.load(html);
    var spanContent = $('.content-page span:first-child').html();
    var num         = spanContent.replace(/[^0-9]/ig, '');
    console.log(subDir + ' 详情页一共[' + num + ']张图片');
    for(var i = 1; i< +num+1; i++){
      var name = i + '.jpg';
      var file = LOCAL_DIR + subDir + '/' + i +'.jpg';
      
      //同步版的 fs.exists()
      if (!fs.existsSync(file)) {
         saveImg(IMG_URL + subDir + '/' + i + '.jpg', LOCAL_DIR + subDir,  name);
      }else{
        console.log(LOCAL_DIR + subDir + '/' + name +' 已存在，跳过');
      }
    }
  })
}


function getWebSource(url, callback) {
  http.get(url, function (res) {
    var data = '';
    res.on('data', function (chunk) {
      data += chunk;
    });
    res.on('end', function() {
      callback(data);
    });
  }).on('error', function() {
    callback(null);
  });
}

function saveImg(url, dir, name){
    //sleep(10);
    //防止请求过于激烈被封，还是温柔点好
    http.get(url, function (res){
        res.setEncoding('binary');
        var data = '';
        res.on('data', function (chunk){
            data += chunk;
        });
        res.on('end', function(){
            fs.writeFile(dir + '/' + name, data, 'binary', function (err) {
                if (err) throw err;
                console.log('file saved ' + dir + '----' + name);
            });
        });
    }).on('error', function (e) {
        console.log('error' + e);
    });
}

function jQueryGetNum(){//使用jQuery得到图片数
  var env = require('jsdom').env;
  getWebSource('http://www.mm131.com/xinggan/2302.html', function(html){
      env(html, function (errors, window) {
         var $ = require('./bower_components/jquery/dist/jquery.js')(window);
         var spanContent= $('.content-page span:first-child').html();
         var num = spanContent.replace(/[^0-9]/ig, '');
         console.log(num);
      })
  })
}
