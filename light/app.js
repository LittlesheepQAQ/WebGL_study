// 引入http模块
var http = require('http')
var fs = require('fs')
// 创建web服务器
var server = http.createServer()
// 监听用户请求
server.on('request', function(req, res){
    fs.readFile('./light.html', 'utf8', function(err,data){
        if(err){
            console.log(err)
            return;
        }
        res.end(data)
    })
})
// 启动服务
server.listen(8080, function(){
    console.log('启动成功，访问：http://localhost:8080')
})