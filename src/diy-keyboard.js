(function (root){
	//键盘辅助类
	var _keyboard_ = {
		//系统常量
		FINAL_MAP: {
			//触发键盘的输入框（CLASS/ID）
			"RENDER": ".diy-keyboard",
			//键盘选择器
			"KEYBD": "#diy-keyboard",
			//键位使用类样式（仅CLASS）
			"KEYS": ".diy-key",
			//横屏键位
			"KEYS_HORI": ".diy-key-hori",
			//退出动画
			"KEYBD_HIDE": ".diy-keyboard-hide",
			//输入区域
			"TEXTAREA": ".diy-textarea", 
			//光标
			"CURSOR": "#diy-cursor",
			//光标样式
			"CURSOR_": ".diy-cursor",
			//空白填充
			"BLANK": ".diy-blank",
			//滚动容器类名
			"SCROLL": "diy-scroll",
			//输入值类名
			"IN_CLASS": "diy-in",
			//禁用样式
			"DISABLED": "diy-disabled",
			//确认样式
			"FINISH": "diy-finish",
			"DELETE": "diy-del",
			//确认禁用样式
			"DISFINISH": "diy-finish-disabled",
			//隐藏样式
			"HIDDEN": "diy-hidden",
			//列数
			"COLS": 4,
			//是否ios8以上的设备
			"IOS8": false
		},
		//获得DOM对象
		getDoc: function (selector)
		{
			return selector.match(/\#\S+/g)
				? document.querySelector(selector)
				: document.querySelectorAll(selector)
		},
		//实现往dom节点添加class
		addClass: function(doc, className) {
			if(!doc)	return ;
			var oldName = typeof doc.className == "undefined" ? "" : doc.className,
				classes = oldName.split(/\s/),
				i = 0;
			for(; i < classes.length; i++) {
				if(className == classes[i])		break;
			}
			if(i == classes.length && className != "")
			{
				doc.className = oldName + (oldName == "" ? "" : " ") + className;
			}
		},
		//实现往dom节点删除class
		removeClass: function(doc, className) {
			if(!doc)	return ;
			var oldName = doc.className == undefined ? "" : doc.className,
				classes = oldName.split(/\s/);
			for(var i = 0; i < classes.length; i++) {
				if(className == classes[i])
				{
					classes[i] = "";
					break;
				}
			}
			if(classes.join(" ") == "")
			{
				doc.removeAttribute("class");
			} else {
				doc.className = classes.join(" ").trim();
			}
		},
		//创建节点
		createNode: function(type, selector, text) {
			var obj = document.createElement(type);
			if(selector.indexOf("#") != -1)
			{
				obj.setAttribute("id", selector.substr(1));
			} else if(selector.indexOf(".") != -1) {
				obj.setAttribute("class", selector.substr(1));
			}
			if(text)	{ obj.innerHTML = text; }
			return obj;	
		},

		//金额处理
		money: function(inp, txt) {
			var _this = this,
				mp = _this.FINAL_MAP;
			if(txt.indexOf(".") === -1 && txt != "")
			{
				inp.appendChild(_this.createNode("span", mp["IN_CLASS"], "."));
				inp.appendChild(_this.createNode("span", mp["IN_CLASS"], "0"));
				inp.appendChild(_this.createNode("span", mp["IN_CLASS"], "0"));
			} else if(txt.indexOf(".") != -1){
				var money = txt.split(".")[0],
					point = txt.split(".")[1],
					thous = [],
					min = 2,
					j = 0;
				if(money.length == 0)
				{
					inp.insertBefore(
						_this.createNode("span", mp["IN_CLASS"], "0"),
						inp.childNodes[0]
					);
				}
				for(var i=0;i<min;i++)
				{
					if(point.length<=i)
					{
						inp.appendChild(
							_this.createNode("span", mp["IN_CLASS"], "0")
						);
					}
				}
			}
		},
		//添加分隔符   sign分隔符号  num间隔位数  left=true:方向 左->右
		addComma: function(inp, txt, sign, num, left) {
			var i=0,j=0,
				inte = String(txt).split(".")[0],
				_this = this,
				mp = _this.FINAL_MAP;
			while(inp.childNodes.length > 0)
			{
				if(i === inte.length)	break;
				if(inp.childNodes[i] && inp.childNodes[i].innerText == sign)
				{
					inp.removeChild(inp.childNodes[i]);
					continue;
				}
				i++;
			};

			if(left)
			{
				var max = inte.length;
				while(true)
				{
					j+=num;
					if(j>=max)	break;
					inp.insertBefore(
						_this.createNode("span", mp["IN_CLASS"], sign),
						inp.childNodes[j]
					);
					console.log("add:"+j);
					j++;
					max++;
				}
			} else {
				j = inte.length;
				while(true)
				{
					j-=num;
					if(j<=0)	break;
					inp.insertBefore(
						_this.createNode("span", mp["IN_CLASS"], sign),
						inp.childNodes[j]
					);
				}
			}
		},
		//允许小数点后多少位
		fixed: function(txt, length) {
			if(txt.indexOf(".") > -1)
				return txt.substr(txt.indexOf(".") + 1).length <= length
			else 
				return true
		},
		//处理长按事件
		touching: function(obj, time, callback, over) {
			var timer = null;
			obj.addEventListener('touchstart', function(event) {
				event.preventDefault();
	            var i = 0,p = 100;
	            timer = setInterval(function(){
	                i+=p;
	                //write it over if i have free => if(maxTime && i>= maxTime)
	                if(i >= time){
	                    callback();
	                }
	            },p)
	
	        });
	        obj.addEventListener('touchend', function(event) {
	            clearTimeout(timer);
	        	over();
	        	return false;
	        }, false);
		},
		//屏幕缩放比
		screenDPI: function() {
			var view = document.querySelector("meta[type=viewport]"),
				cont = view ? view.getAttribute("content") : null,
				dpi = 1,
				sets = null,
				mp = this.FINAL_MAP;
			if(cont)	{ sets = cont.replace(/\s/g, "").split(";"); }
			sets && sets.forEach(function(item, index) {
				var key = item.split("=")[0],
					val = item.split("=")[1];
				if(key === "initial-scale") {
					dpi = parseFloat(val);
				}
			});
			this.windowDPI = dpi;
		},
		//同步滚动高度
		scrollHeight: function(isActive) {
			//将输入框滑动到键盘上面
			var _this = _keyboard_,
				kb = keyboard,
				mp = _this.FINAL_MAP,
				scroll = kb.scrollBox(),
				isActive = kb.active,
				kbHeight = _this.getDoc(mp["KEYBD"]).clientHeight,
				bdHeight = document.documentElement.clientHeight,
				scHeight = scroll.clientHeight > bdHeight ? bdHeight : scroll.clientHeight;
			if(scroll === document.body) {
				var elem = document.createElement("div"),
					nodes = document.body.childNodes;
				document.body.appendChild(elem);
				nodes.forEach(function(item, index) {
					elem.appendChild(item);
				});
				elem.style.maxHeight = isActive ? bdHeight - kbHeight : bdHeight + kbHeight;
			} else {
				if(isActive) {
					//_this.addClass(scroll, mp["SCROLL"]);
					//scroll.style.maxHeight = (scHeight - kbHeight) + "px";
					scroll.appendChild(kb["blank"]);
				} else {
					//_this.removeClass(scroll, mp["SCROLL"]);
					//scroll.style.maxHeight = "none";
					scroll.removeChild(kb["blank"]);
				}
			}
		},
		//修复高度变化所引起的位置变化
		scrollTop: function() {
			var _this = _keyboard_,
				kb = keyboard,
				mp = _this.FINAL_MAP,
				ele = kb.currentElement,
				pos = ele.getBoundingClientRect(),
				max = window.screen.height - 192 * _this.windowDPI,
				doc = kb.scrollBox();
				//alert(pos.bottom +","+ max)
			if(pos.bottom > max) {			
				doc.scrollTop = (doc.scrollTop + (pos.bottom - max) + 10);
			}
		}
	};
	
	//键盘对象
	var keyboard = {
		//当前聚焦元素
		currentElement: null,
		//正在输入[游标使用中]
		pressIng: false,
		//键盘激活[键盘打开中]
		active: false,
		//游标索引
		cursorIndex: 0,
		//游标使用延时重新加载动画  的延时对象
		cursorTimeout: null,
		//scrollElement: ".view_scroll",
		
		validate: new RegExp(/^\S+$/),
		
		scrollBox: function() {
			var _this = _keyboard_;
			if(this.scrollElement) {
				var elem = this.scrollElement instanceof Object
					? this.scrollElement
					: _this.getDoc(this.scrollElement);
				if(elem.length)		{ elem = elem.length > 0 ? elem[0] : null; }
				return elem;
			} else {
				return document.body;
			}
		},
		
		keys: [
			/**
			 * txt  {string} 键盘显示文本
			 * cols {number} 键位宽度 = 键盘总宽度/cols
			 * sn   {number} 排列顺序
			 * html {string} 使用待选库中的网页代码
			 */
			{txt: "1", row: 1, sn : 1},
			{txt: "2", row: 1, sn : 2},
			{txt: "3", row: 1, sn : 3},
			{txt: "",  row: 1, sn : 4, attr: 'rowspan="2"', className: "diy-del"},
			{txt: "4", row: 2, sn : 5},
			{txt: "5", row: 2, sn : 6},
			{txt: "6", row: 2, sn : 7},
			{txt: "7", row: 3, sn : 8},
			{txt: "8", row: 3, sn : 9},
			{txt: "9", row: 3, sn : 10},
			{txt: "确认",  row: 3, sn : 11, attr: 'rowspan="2"', className: "diy-finish"},
			{txt: ".", row: 4, sn : 12},
			{txt: "0", row: 4, sn : 13},
			{txt: "", row: 4, sn : 14, className: "diy-hidden"}
		],
		
		//设置键位状态	keys = { sn: 1,status: "disabled" }
		setKeys: function(keys) {
			var _this = _keyboard_,
				kb = keyboard,
				mp = _this.FINAL_MAP,
				ks = kb.keys,
				doc = _this.getDoc(mp["KEYS"]);
			console.log(JSON.stringify(keys))
			for(var i=0;i<keys.length;i++) {
				var key = keys[i],
					obj = doc[key.sn-1];
				if(key.status === "disabled") {
					_this.addClass(obj, key.sn === 11 ? mp["DISFINISH"] : mp["DISABLED"]);
					_this.removeClass(obj, mp["HIDDEN"]);
				} else if(key.status === "abled") {
					_this.removeClass(obj, key.sn === 11 ? mp["DISFINISH"] : mp["DISABLED"]);
					_this.removeClass(obj, mp["HIDDEN"]);
				} else if(key.status === "hidden") {
					_this.removeClass(obj, mp["DISABLED"]);
					_this.addClass(obj, mp["HIDDEN"]);
				}
			}
		},
		//显示/关闭游标
		showCursor: function(flag, sn) {
			var _this = _keyboard_,
				kb = keyboard,
				cursor = kb["cursor"],
				input = kb["currentElement"].childNodes[0],
				texts = input.childNodes[0].childNodes,
				cnWidth = 0;
			if(flag)
			{
				kb.pressIng = true;
				cursor.style.visibility = "visible";
				if(sn === -1)
				{
					input.appendChild(cursor);
				} else if(sn >= 0) {
					sn = sn > texts.length ? texts.length : sn;
					if(texts.length > 0)
					{
						if(texts[0].innerText != ".")
							cnWidth = texts[0].offsetWidth;
						else if(texts.length > 1)
							cnWidth = texts[1].offsetWidth;
					}
					if(cnWidth > 0)
					{
						//解决某些字体 数字和符号宽度不一致，而导致的游标错位
						for(var i=0;i<texts.length;i++)
						{
							texts[i].style.width = cnWidth + "px";
						}
					}
					var left = -(cnWidth * (texts.length - sn)) - 1;
					cursor.style.marginLeft = left + "px";
					
					//记录游标的位置
					kb.cursorIndex = sn;
				}
			} else {
				kb.pressIng = false;
				cursor.style.visibility = "hidden";
			}
		},
		//暂停光标闪烁（用于正在输入、正在删除）
		stopCursor: function() {
			var _this = _keyboard_,
				kb = keyboard,
				mp = _this.FINAL_MAP;
			kb["cursor"].className = mp["CURSOR_"].replace(".","");
			if(kb.cursorTimeout != null)
			{
				clearTimeout(kb.cursorTimeout);
			}
			kb.cursorTimeout = setTimeout(function() {
				kb["cursor"].className = "";
			}, 300);
		},
		//初始化参数
		initParams: function() {
			var _this = _keyboard_,
				kb = keyboard,
				mp = _this.FINAL_MAP,
				keys = '<div class="diy-row">',
				maxW = document.body.clientWidth;
			//IOS8以上（retina屏优化）
			if(!!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/))
            {
                var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
                mp["IOS8"] = parseInt(v[1], 10) >= 8;
            }
			//补充键位自动属性
			kb["keysName"] = mp["KEYS"];
			kb["render"] = mp["KEYBD"];
			//组装HTML
			var currentRow = 1,rows = {};
			for(var i=0;i<kb.keys.length;i++)
			{
				var kk = kb.keys[i],
					num = kk["row"];
				rows[num] = rows[num] ? rows[num] : [];
				rows[kk["row"]].push(kk);
			}
			var htmls = [];
			for(var r in rows)
			{
				var cols = rows[r],
					cls = mp["IOS8"] ? "class='retina-adp'" : "",
					colsCode = [];
				for(var i=0;i<cols.length;i++) {
					var col = cols[i],
						val = col["txt"],
						attr = col["attr"] ? col["attr"] : "",
						wid = maxW/mp["COLS"],
						clss = col["className"] ? "diy-key " + col["className"] : "diy-key";
					colsCode.push('<td '+attr+' width="25%"><div class="'+clss+
						'" style="'+wid+'">'+val+'</div></td>');
				}
				htmls.push("<tr>" + colsCode.join("") + "</tr>");
			}
			var htmlCode = "<table cellpadding=0 cellspacing=0 "+cls+">" + htmls.join("") + "</table>"
			kb["cursor"] = _this.createNode("span", mp["CURSOR"]);
			kb["node"] = _this.createNode("div", kb["render"], htmlCode);
			kb["blank"] = _this.createNode("div", mp["BLANK"]);
			//初始化dpi
			_this.screenDPI();
		},
		//格式化键盘输入
		format: function(formt, blur, text) {
			var _this = _keyboard_,
				kb = keyboard,
				mp = _this.FINAL_MAP,
				doc = kb.currentElement,
				inp = doc.childNodes[0].childNodes[0],
				txt = String( text == undefined 
					? (doc.getAttribute["value"] == undefined ? "" : doc.getAttribute["value"]) 
					: text ),
				dmt = doc.getAttribute["format"],
				fmt = formt != undefined && formt != "" ? formt
					: (dmt == undefined ? "number" : dmt),
				ft = kb.currentElement.getAttribute["real-time"] == undefined
					? true : (
						kb.currentElement.getAttribute["real-time"].value == "false"
						? false : true
					),	//实时-格式化
				invalid = true;
				console.log("txt:"+txt+",val:"+doc.getAttribute["value"])
			//确认键控制
			kb.setKeys([{sn: 11, status: kb.validate.test(kb.getValue())?"abled":"disabled"}])
			switch(fmt)
			{
			case "number":
				kb.setKeys([{sn: 12,status: txt.indexOf(".") > -1?"disabled":"abled"}]);
				break;
			case "integer":
				kb.setKeys([{sn: 12,status: "disabled"}]);
				break;
			case "money"://###,###,###.##
				kb.setKeys([{sn: 12,status: txt.indexOf(".") > -1?"disabled":"abled"}]);
				if(blur == 1)
				{
					_this.addComma(inp, txt, ",", 3, false);
					_this.money(inp, txt);
				} else {
					if(ft && blur != 2) {//实时格式化
						_this.addComma(inp, txt, ",", 3, false);
					}
				}
				//最多小数位后2位
				invalid = _this.fixed(txt, 2);
				
				//已经有整数位不能再最前面+0
				if(txt.split(".")[0].length>0 && kb.cursorIndex == 0)
				{
					invalid == false;
				}
				break;
			case "moneyNoComma"://不使用千分位分隔符
				kb.setKeys([{sn: 12,status: txt.indexOf(".") > -1?"disabled":"abled"}]);
				if(blur == 1) //失焦时的格式化	自动加入小数点后两位
				{
					_this.money(inp, txt);
				}
				//最多小数位后2位
				invalid = _this.fixed(txt, 2);
				break;
			case "bankCard":
				kb.setKeys([{sn: 12,status: "disabled"}]);
				if(blur) //失焦时的格式化	自动加入空格
				{
					_this.addComma(inp, txt, " ", 4, true);
				}
				break;
			default:
				//as same as number
				kb.setKeys([{sn: 12,status: txt.indexOf(".") > -1?"disabled":"abled"}]);
			}
			//更新VALUE
			kb.getValue();
			//通用处理
			if(txt.substr(0,1) == ".")
			{
				
			}
			return invalid;
		},
		
		//按下键盘触发事件
		pressIn: function(e) {
			e.preventDefault();
			var _this = _keyboard_,
				kb = keyboard,
				mp = _this.FINAL_MAP,
				div = kb.currentElement,//触发容器
				inp = div.childNodes[0],//输入框DIV
				obj = inp.childNodes[0],//当前输入框
				btn = e.currentTarget,	//当前键盘键位
				inc = mp["IN_CLASS"],//输入
				txt = btn.innerHTML,
				reg = new RegExp(mp["HIDDEN"]+"|"+mp["FINISH"]);//隐藏键盘按钮
			//已被禁用
			if(btn.className.indexOf(mp["DISABLED"]) > -1 || btn.className.indexOf(mp["DISFINISH"]) > -1)
			{
				return ;
			}
			else if(btn.className.indexOf(mp["DELETE"]) > -1) {
				if(kb.cursorIndex>0) {
					obj.removeChild(obj.childNodes[kb.cursorIndex-1]);
					kb.cursorIndex--;
				}
			}
			//关闭键盘
			else if(reg.test(btn.className)) {
				kb.toggle();
			}
			//输入字符
			else {
				//格式输入控制
				var cutval = String(kb.getValue()),
					updval = cutval.substr(0, kb.cursorIndex) + 
						txt + cutval.substr(kb.cursorIndex)
				if(kb.format("", 2, updval))
				{
					if(updval === "." && updval === txt) {
						obj.insertBefore(
							_this.createNode("span", "." + inc, 0),
							obj.childNodes[kb.cursorIndex]
						);
					}
					obj.insertBefore(
						_this.createNode("span", "." + inc, txt),
						obj.childNodes[kb.cursorIndex]
					);
					kb.setValue();
					kb.showCursor(true, ++kb.cursorIndex);
				}
			}
			kb.pressAfter();
			return true;
		},
		//输入格式和光标处理
		pressAfter: function() {
			var _this = _keyboard_,
				kb = keyboard,
				div = kb.currentElement,//触发容器
				inp = div.childNodes[0],//输入框DIV
				obj = inp.childNodes[0],//当前输入框
				crs = kb["cursor"];	//光标
			//刷新value并格式检查
			kb.getValue();
			//kb.format("", 0);
			//移动输入值
			if(obj.offsetWidth > inp.clientWidth)
			{
				inp.scrollLeft = obj.offsetWidth - inp.clientWidth + 2;
			}
			//移动光标
			crs.style.marginLeft = obj.offsetWidth;
			//暂停光标动画
			kb.stopCursor();
		},
		intoDocument: function() {
			var _this = _keyboard_,
				kb = keyboard,
				mp = _this.FINAL_MAP,
				obj = _this.getDoc(mp["KEYBD"]);
			//初始化 显示键盘
			document.body.appendChild(kb["node"]);
			//初始化 自定义光标
			document.body.appendChild(kb["cursor"]);
			//绑定键位输入事件
			var keys = _this.getDoc(kb["keysName"]);
			for(var i=0;i<keys.length;i++)
			{
				if(keys[i].className.indexOf(mp["DELETE"]) > -1) {
					_this.touching(keys[i], 500, function() {
						var obj = kb.currentElement.childNodes[0].childNodes[0];
						if(kb.cursorIndex>0) {
							obj.removeChild(obj.childNodes[kb.cursorIndex-1]);
							kb.cursorIndex--;
							kb.stopCursor();
						}
					}, function() {
						kb.pressAfter();
					});
				}
				keys[i].addEventListener('touchend', kb.pressIn);
			}
			//键盘不触发浏览器滑动
			kb["node"].addEventListener('scroll', function(e) {
				e.stopPropagation();
			});
			
		},
		//启用键盘
		showKeyboard: function(e) {
			e.stopPropagation();
			var _this = _keyboard_,
				kb = keyboard,
				mp = _this.FINAL_MAP,
				obj = _this.getDoc(mp["KEYBD"]),
				pressObj = e.currentTarget,
				cursorNum = -1,
				area = pressObj.childNodes[0].childNodes[0],
				isCurrent = false;
			//失焦
			if(kb["currentElement"] != null && !(kb["currentElement"] === pressObj))
			{
				kb.format("", 1);
				isBlur = true;
			}
			if(kb["currentElement"] === pressObj) {
				isCurrent = true;
			} else {
				kb["currentElement"] = pressObj;
			}
			if(obj === null)
			{
				kb.intoDocument();
			} else {
				//游标移动
				kb["cursor"].style.marginLeft = 0;
				pressObj.childNodes[0].appendChild(kb["cursor"]);
				if(area.childNodes.length > 0)
				{
					var size = {
						crtX: e.changedTouches[0].clientX,
						crtY: e.changedTouches[0].clientY,
						inpX: area.getBoundingClientRect().left,
						inpY: area.getBoundingClientRect().top,
						wid: area.childNodes.length > 0
							? area.childNodes[0].offsetWidth
							: 0
					};
					cursorNum = area.childNodes.length > 0
						? Math.round((size.crtX - size.inpX)/size.wid) : 0;
				}
			}
			if(!kb.active) {
				kb.toggle();
			}
			kb.format();
			kb.showCursor(true, cursorNum);
		},
		//打开/关闭键盘
		toggle: function() {
			var _this = _keyboard_,
				kb = keyboard,
				mp = _this.FINAL_MAP,
				scr = kb.scrollBox(),
				obj = document.getElementById(mp["KEYBD"]),
				styles = {
					show: "show-keyword .3s",
					hide: "hide-keyword .3s",
					cname: mp["KEYBD_HIDE"].replace(/\.|\#/g, "")
				}
			if(kb.active) { //隐藏
				kb.active = false;
				_this.addClass(kb["node"], styles.cname);
				scr.removeChild(kb["blank"]);
				kb.showCursor(false);
			} 
			else {
				kb.active = true;
				_this.removeClass(kb["node"], styles.cname);
				scr.appendChild(kb["blank"]);
				kb.showCursor(true);
			}
			//修正网页内容高度
			//_this.scrollHeight();
			//修正网页滚动位置
			_this.scrollTop();
		},
		//初始化需绑定事件
		bindEvent: function(params) {
			var _this = _keyboard_,
				kb = keyboard,
				map = _this.FINAL_MAP,
				kbs = _this.getDoc(map["RENDER"]);
			if(kbs != null)
			{
				for(var i=0;i<kbs.length;i++) {
					//键盘触发
					kbs[i].addEventListener('touchend', kb.showKeyboard);
					//选择时关闭光标
					kbs[i].addEventListener('select', function(e) {
						_this.showCursor(false);
					});
					//加入文本输入区域
					kbs[i].innerHTML = 
						'<div class="diy-input">' +
							'<span class="diy-textarea"></span>' +
						'</div>';
					//同步value值到输入域	
					kb.setValue(kbs[i]);
				}
			}
		},
		
		setValue: function(doc, value) {
			var _this = _keyboard_,
				kb = keyboard,
				mp = _this.FINAL_MAP,
				elemt = kb.currentElement,
				ele = doc ? doc : elemt,
				inp = ele.childNodes[0].childNodes[0],
				val = value ? value : (ele.getAttribute["value"] || ''),
				txt = val.replace(/[\s,]/g, "");
			val.split("").forEach(function(item, index) {
				inp.appendChild(_this.createNode("span", mp["IN_CLASS"], item));
			});
			//kb.currentElement = ele;
			//kb.format("", 0);
			//kb.currentElement = elemt;
			ele.setAttribute("value", val);
		},
		
		getValue: function(doc) {
			var _this = _keyboard_,
				kb = keyboard,
				ele = doc ? doc : kb.currentElement,
				txt = ele.childNodes[0].childNodes[0],
				val = txt.innerText.replace(/[\s,]/g,"");
			val = (parseFloat(val) + "" === "NaN") ? val : parseFloat(val);
			return val;	
		},
		
		init: function (param){
			var _this = this;
			_this.initParams();
			_this.bindEvent(param);
		}
	};
	
	//默认渲染-读取dom
	document.addEventListener('DOMContentLoaded', function (){
		keyboard.init();
	});
	
	//可以使用对象DIYKeyboard调用键盘函数
	var _moduleExport = function(myfun) {
		if (typeof define === "function" && define.amd) { //AMD
			define(function() {
				return myfun;
			});
		} else if (typeof exports === 'object') { //Node, CommonJS之类的
			module.exports = myfun;
		} else { //浏览器全局变量(root 即 window)
			root.DIYKeyboard = myfun;
		}
	}
	_moduleExport(keyboard);
})(window);