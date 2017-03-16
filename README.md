# CaaT
## Comment as a Template 注释即模板
* this tool use comment within a HTML-tag as template,then use the data binded to this template to generate and fill content within this HTML-tag
* 本工具使用HTML标签内的注释作为模板,再以绑定的数据生成相应HTML内容

## Simple example 简单示例 
```javascript
  caat_init("#explame2");
  data = [{
    key: "k1",
    value: 10000
  }, {
    key: "k2",
    value: 20000
  }, {
    key: "k3",
    value: 30000
  }];
  
  html = caat_loopInvoke('#explame2', data);
  $('#explame2').html(html);
```
```html
<div id="explame2">
  <!--%LoopTemplate%
  <span>{:i+1},{key}={value}</span><br />
  %EndLoop%-->
</div>
```
result 最终结果:
```html
<div id="explame2">
  <span>1,k1=10000</span><br>
  <span>2,k2=20000</span><br>
  <span>3,k3=30000</span><br>
</div>
```

## Author 作者
* RdaOniCelK
* rdaonicelk@qq.com
* 