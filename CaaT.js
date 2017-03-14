function _caat_tmplTxtFilter(str) {
    var s, e;
    s = str.indexOf("<!--%LoopTemplate%");
    e = str.lastIndexOf("%EndLoop%-->")
    if (s < 0 || e < 0) {
        return null;
    }

    return str.substring(s + 18, e);
}

function caat_init(selector) {
    var tmpl;
    if (!(tmpl = $(selector).data('tmpl'))) {
        tmpl = $(selector).html();
        tmpl = _caat_tmplTxtFilter(tmpl);
        $(selector).data('tmpl', tmpl);
    }
    return tmpl;
}

function _caat_findNextLevelTmpl(str) {
    var tmpls = [];
    var s, e;
    var p = 0;
    for (var i = 0; i < 100; ++i) {
        var name, start, end, key, sub, def;
        //找开始
        s = str.indexOf("%LoopTemplate[", p);
        if (s < 0) break;
        start = s;
        p = s + 14;
        //找名字
        e = str.indexOf("](", p);
        if (e < 0) break;
        name = str.substring(p, e);
        p = e + 2;
        //找映射key
        e = str.indexOf(")%", p);
        if (e < 0) break;
        key = str.substring(p, e);
        p = e + 2;
        //找结束
        s = p; //模板开始
        e = str.indexOf("%EndLoop[" + name + "]%", p);
        if (e < 0) break;
        //模板内容
        def = str.substring(s, e);

        p = e + 11 + name.length;
        end = p; //模板结束
        //继续找下一层模板
        sub = _caat_findNextLevelTmpl(def);
        tmpls[i] = { name: name, start: start, end: end, key: key, sub: sub, def: def };
    }
    if (tmpls != null && tmpls.length <= 0) return null;
    return tmpls;
}

function _caat_loopInvokeTask(tmplStr, arr, subTmpl) {
    var html = "";
    var tmplStrBlocks = []; //被下层模板划分出多块只有本层的模板
    var tmplStrBlocksKeys = [];
    if (subTmpl == null || subTmpl.length <= 0) { //最底层
        tmplStrBlocks[0] = tmplStr;
    } else { //还有下层
        tmplStrBlocks[0] = tmplStr.substring(0, subTmpl[0].start);
        var i = 1;
        for (; i < subTmpl.length; ++i) {
            tmplStrBlocks[i] = tmplStr.substring(subTmpl[i - 1].end, subTmpl[i].start);
        }
        tmplStrBlocks[i] = tmplStr.substr(subTmpl[i - 1].end);
    }
    for (var i = 0; i < tmplStrBlocks.length; ++i) {
        //tmplStrBlocksKeys[i] = tmplStrBlocks[i].match(/\{\$*\w*\}/g);
        tmplStrBlocksKeys[i] = tmplStrBlocks[i].match(/\{[^\r\n\{\}]+\}/g);
        if (tmplStrBlocksKeys[i] == null) tmplStrBlocksKeys[i] = [];
    }

    for (var i = 0; i < arr.length; ++i) {
        for (var j = 0; j < tmplStrBlocks.length; ++j) {
            //映射值到该段模板
            var htmlBlock = tmplStrBlocks[j];
            for (var k = 0; k < tmplStrBlocksKeys[j].length; ++k) {
                var keyOuter = tmplStrBlocksKeys[j][k];
                var key = keyOuter.substr(1, keyOuter.length - 2);
                switch (key) {
                    // case "$i": //本元素所在的index
                    //     htmlBlock = htmlBlock.replace(keyOuter, i + 1);
                    //     break;
                    case "$$": //本元素
                        htmlBlock = htmlBlock.replace(keyOuter, arr[i]);
                        break;
                    default:
                        if (key.charAt(0) == ':') { //表达式
                            var expr = key.substr(1);
                            expr = expr.replace('$$', 'arr[i]');
                            var exprKeys = expr.match(/\$\w+\$/g);
                            if (exprKeys != null && exprKeys.length > 0) {
                                for (var z = 0; z < exprKeys.length; ++z) {
                                    var exprKeyOuter = exprKeys[z];
                                    var exprKey = exprKeyOuter.substr(1, exprKeyOuter.length - 2);
                                    expr = expr.replace(exprKeyOuter, 'arr[i].' + exprKey);
                                }
                            }
                            //alert(keyOuter);
                            var ret = eval(expr);
                            htmlBlock = htmlBlock.replace(keyOuter, ret);
                        } else //按key取值
                            htmlBlock = htmlBlock.replace(keyOuter, arr[i][key]);
                }
            }
            html += htmlBlock;
            //alert(htmlBlock);
            //生成紧接这段模板后的子模板的HTML代码
            if (j < tmplStrBlocks.length - 1) //最后一块后没子模板
            {
                html += _caat_loopInvokeTask(subTmpl[j].def, arr[i][subTmpl[j].key], subTmpl[j].sub);
            }
        }
    }
    return html;
}

function caat_loopInvoke(selector, arrData) {
    var target = $(selector);
    var tmpl = target.data('tmpl');
    var tmplTree = _caat_findNextLevelTmpl(tmpl);
    var html = "";

    html = _caat_loopInvokeTask(tmpl, arrData, tmplTree);
    return html;
}