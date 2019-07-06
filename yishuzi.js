const request = require('request'),
    cheerio = require('cheerio'),
    fs = require('fs'),
    readline = require('readline');

//下一个姓名标志
let next = 0;
//姓名列表
let names = [];
//加载姓名列表文件
let readObj = readline.createInterface({
    input: fs.createReadStream("name.txt")
});
//读取姓名列表文件
readObj.on('line', function (line) {
    names.push(line);
});
//读取完成开始进行爬虫作业
readObj.on('close', function () {
    getNameImg(names[next]);
});

/**
 * 根据姓名获取个性签名图片
 * @param name
 */
function getNameImg(name) {
    //判断是否已经抓紧完成
    if (next == names.length) {
        logShow('爬虫作业已完成，请至文件夹查看');
        return;
    }
    logShow('正在爬取：' + name);
    let host = "http://www.yishuzi.com/a/re.php";
    let data = {
        id: name,
        idi: 'jiqie',
        //字体参数
        id1: 326,
        //字体颜色
        id2: '#FFFFFE',
        id3: '',
        //图片背景
        id4: '#000000',
        id5: '',
        //字体边框色
        id6: '#FF0000'
    };
    request.post({
        url: host,
        headers: {
            "Content-Type":"application/x-www-form-urlencoded"
        },
        form: data
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            //解析图片dom
            let $ = cheerio.load(body);
            //这里可以自己改文件夹，记得先创建好
            request.get($('img').attr('src')).pipe(fs.createWriteStream('./images/' + name + '.png').on("finish",function () {
                logShow(name + "的个性签名已经生成");
                //延时一秒后继续执行
                setTimeout(function () {
                    getNameImg(names[++next]);
                },1000)
            }));
        } else {
            logShow(error);
        }
    });
}

/**
 * 打印日志
 * @param msg
 */
function logShow(msg) {
    console.log(msg);
}