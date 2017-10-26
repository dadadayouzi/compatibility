var utils = (function () {
    function listToArray(likeAry) {
        try {
            return [].slice.call(likeAry, 0);
        } catch (e) { // 只有try里面报错 才会执行catch里面的
            var newArr = [];
            for (var i = 0; i < likeAry.length; i++) {
                newArr[newArr.length] = likeAry[i];
            }
            return newArr;
        }
    }


    function jsonParse(data) { // 将json字符串转化为json对象兼容写法
        return "JSON" in window ? JSON.parse(data) : eval('(' + data + ')')
    }

    // 获取/设置 document文档 盒模型属性
    function win(attr, val) {
        if (typeof val === 'undefined') { // 获取
            return document.documentElement[attr] || document.body[attr]
        }
        // 设置
        if (typeof val === 'number') {
            document.documentElement[attr] = val;
            document.body[attr] = val;
        }

    }

    // 获取元素距离body的偏移
    function offset(ele) {
        var l = ele.offsetLeft;
        var t = ele.offsetTop;
        var p = ele.offsetParent;

        while (p.nodeName !== "BODY") {
            if (navigator.userAgent.indexOf("MSIE 8.0") === -1) {
                l += p.clientLeft;
                t += p.clientTop;
            }
            l += p.offsetLeft;
            t += p.offsetTop;
            p = p.offsetParent;
        }
        return {
            left: l,
            top: t
        }
    }


    /**
     * getCss 获取样式
     * @param curEle  当前元素
     * @param attr 样式属性
     * @returns {Number|String} 获取的样式值
     */
    function getCss(curEle, attr) {
        var val;
        var reg;
        if ("getComputedStyle" in window) {
            val = window.getComputedStyle(curEle, null)[attr];
        } else { // IE Low filter
            if (attr === 'opacity') {
                // 'alpha(opacity=10)'
                val = curEle.currentStyle['filter'];
                reg = /alpha\(opacity=((?:\d|[1-9]\d+)(?:\.\d+)?)\)/;
                var temp = reg.exec(val);
                // 确保有没有捕获到 如果捕获到就 得到第一个分组内容 否则返回默认值 1
                val = temp ? temp[1] / 100 : 1;
            } else {
                val = curEle.currentStyle[attr];
            }
        }
        //去掉样式值的单位 比如10px 8em 19rem 0.3 获取到的样式值 都是字符串 block red
        reg = /^[+-]?(\d|[1-9]\d+)(\.\d+)?(px|em|rem|pt)?$/;
        return reg.test(val) ? parseFloat(val) : val;
    }

    /**
     * setCss 设置元素样式
     * @param curEle 当前元素
     * @param attr 样式属性
     * @param val  样式值
     */
    function setCss(curEle, attr, val) {
        if (attr === 'opacity') {
            curEle.style[attr] = val;
            curEle.style['filter'] = 'alpha(opacity=' + val * 100 + ')';
            return;
        }

        if (attr === 'float') {
            curEle.style.cssFloat = val;
            curEle.style.styleFloat = val;
            return;
        }

        // 如果是以下属性 需要 自动添加单位
        var reg = /^width|height|left|top|right|bottom|fontSize|((margin|padding)(Left|Right|Top|Bottom)?)$/;
        if (reg.test(attr)) {
            if (!isNaN(val)) {
                val += 'px';
            }
        }
        curEle.style[attr] = val;
    }

    /**
     * css 单独/批量设置样式
     * @param curEle 当前元素
     * @param attr {String|Object} 样式属性
     * @param val  样式值
     */
    function css(curEle, attr, val) {
        if (typeof attr === 'object') {
            for (var k in attr) {
                setCss(curEle, k, attr[k]);
            }
        } else {
            setCss(curEle, attr, val);
        }
    }

    /**
     * getByClass 通过类名获取元素
     * @param cn 指定类名
     * @param context 上下文
     * @returns {Array} 筛选后的元素集合
     */
    function getByClass(cn, context) {
        context = context || document;
        var eles = context.getElementsByTagName('*');
        var classList = cn.myTrim().split(/ +/);
        for (var i = 0; i < classList.length; i++) {
            var cur = classList[i];
            var reg = new RegExp('\\b' + cur + '\\b');
            var arr = [];
            for (var j = 0; j < eles.length; j++) {
                var ele = eles[j];
                reg.test(ele.className) ? arr[arr.length] = ele : null;
            }
            eles = arr; // 设置筛选范围
        }
        return arr;
    }

    String.prototype.myTrim = function () {
        var reg = /^\s+|\s+$/g;
        return this.replace(reg, '');
    };

    /**
     * hasClass 检测是否存在指定类名
     * @param curEle 当前检测元素
     * @param cn 指定类名
     * @returns {boolean} true false
     */
    function hasClass(curEle, cn) {
        return new RegExp('\\b' + cn + '\\b').test(curEle.className);
    }

    /**
     * addClass 增加类名
     * @param curEle 当前元素
     * @param cn 指定类名
     */
    function addClass(curEle, cn) {
        var list = cn.myTrim().split(/ +/);
        for (var i = 0; i < list.length; i++) {
            cn = list[i];
            if (!hasClass(curEle, cn)) {
                var str = curEle.className.myTrim();
                str += ' ' + cn;
                curEle.className = str.replace(/ +/, ' ');
            }
        }
    }

    /**
     * removeClass 移除类名
     * @param curEle 当前元素
     * @param cn 指定类名
     */
    function removeClass(curEle, cn) {
        var list = cn.myTrim().split(/ +/);
        for (var i = 0; i < list.length; i++) {
            cn = list[i];
            if (hasClass(curEle, cn)) {
                var reg = new RegExp('(^| +)' + cn + '( +|$)');
                var str = curEle.className.replace(reg, ' ').myTrim();
                curEle.className = str.replace(/ +/, ' ');
            }
        }
    }

    /**
     * toggle 切换类名
     * @param curEle 当前元素
     * @param cn 指定类名
     */
    function toggle(curEle, cn) {
        var list = cn.myTrim().split(/ +/);
        for (var i = 0; i < list.length; i++) {
            cn = list[i];
            hasClass(curEle, cn) ? removeClass(curEle, cn) : addClass(curEle, cn);
        }
    }

    /**
     * children 获取所有子元素
     * @param curEle 父级元素
     * @returns {*}
     */
    function children(curEle) {
        if ('children' in curEle) {
            return curEle.children;
        }

        var childNodes = curEle.childNodes;
        var arr = [];
        for (var i = 0; i < childNodes.length; i++) {
            var cur = childNodes[i];
            if (cur.nodeType === 1) {
                arr.push(cur);
            }
        }
        return arr;
    }

    /**
     * prev 获取上一个哥哥元素
     * @param curEle 当前元素
     * @returns {*}
     */
    function prev(curEle) {
        if ('previousElementSibling' in curEle) {
            return curEle.previousElementSibling;
        }
        var p = curEle.previousSibling;
        while (p && p.nodeType !== 1) {
            p = p.previousSibling;
        }
        return p;
    }

    /**
     * prevAll 获取所有哥哥元素
     * @param curEle 当前元素
     * @returns {Array}
     */
    function prevAll(curEle) {
        var p = prev(curEle);
        var arr = [];
        while (p) {
            arr.unshift(p);
            p = prev(p);
        }
        return arr;
    }

    /**
     * next 获取弟弟元素
     * @param curEle 当前元素
     * @returns {*}
     */
    function next(curEle) {
        if ('nextElementSibling' in curEle) {
            return curEle.nextElementSibling;
        }
        var n = curEle.nextSibling;
        while (n && n.nodeType !== 1) {
            n = n.nextSibling;
        }
        return n;
    }

    /**
     * nextAll 获取所有弟弟元素
     * @param curEle 当前元素
     * @returns {Array}
     */
    function nextAll(curEle) {
        var n = next(curEle);
        var all = [];
        while (n) {
            all[all.length] = n;
            n = next(n)
        }
        return all;
    }

    /**
     * sibling 获取相邻两个兄弟元素
     * @param curEle 当前元素
     * @returns {Array}
     */
    function sibling(curEle) {
        var p = prev(curEle);
        var n = next(curEle);
        var eles = [];
        p && eles.push(p);
        n && eles.push(n);
        return eles;
    }

    /**
     * siblings 获取所有兄弟元素
     * @param curEle 当前元素
     * @returns {Array.<*>}
     */
    function siblings(curEle) {
        return prevAll(curEle).concat(nextAll(curEle));
    }

    /**
     * index 获取当前元素索引
     * @param curEle 当前元素
     * @returns {Number}
     */
    function index(curEle) {
        return prevAll(curEle).length;
    }

    /**
     * first 获取第一个子元素
     * @param container
     * @returns {*}
     */
    function first(container) {
        if ('firstElementChild' in container) {
            return container.firstElementChild;
        }
        var first = container.firstChild;
        if (first && first.nodeType !== 1) {
            first = next(first);
        }
        return first;
    }

    /**
     * last 获取最后一个子元素
     * @param container
     * @returns {*}
     */
    function last(container) {
        if ('lastElementChild' in container) {
            return container.lastElementChild;
        }
        var p = container.lastChild;
        if (p && p.nodeType !== 1) {
            p = prev(p);
        }
        return p;
    }

    /**
     * prepend 插入到容器前面
     * @param ele
     * @param container
     */
    function prepend(ele, container) {
        var first = first(container);
        if (first) {
            container.insertBefore(ele, first);
            return
        }
        container.appendChild(ele);
    }

    /**
     * insertAfter 将元素插入到另个元素的后面
     * @param newEle 新元素
     * @param oldEle 旧元素
     */
    function insertAfter(newEle, oldEle) {
        var n = next(oldEle);
        var par = oldEle.parentNode;
        if (n) {
            par.insertBefore(newEle, n);
            return;
        }
        par.appendChild(newEle);
    }

    return {
        listToArray: listToArray,
        jsonParse: jsonParse,
        win: win,
        offset: offset,
        getCss: getCss,
        setCss: setCss,
        css: css,
        getByClass: getByClass,
        hasClass: hasClass,
        addClass: addClass,
        removeClass: removeClass,
        toggle: toggle,
        children: children,
        prev: prev,
        prevAll: prevAll,
        next: next,
        nextAll: nextAll,
        sibling: sibling,
        siblings: siblings,
        first: first,
        last: last,
        prepend: prepend,
        insertAfter: insertAfter
    }
})();