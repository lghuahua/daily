
proxy_redirect说明
语法：proxy_redirect [ default|off|redirect replacement ]

默认值：proxy_redirect default

使用字段：http, server, location

如果需要修改从被代理服务器传来的应答头中的"Location"和"Refresh"字段，可以用这个指令设置。

proxy_redirect http://localhost:8000/a/ http://frontend/b/;
将Location字段重写为http://frontend/b/some/uri