const { ipcRenderer } = require("electron")


/**
 * 
 * @param {obj} obj 任务对象
 * 
 */
exports.startTask= async function (obj) {
    try{
		const {onceTime,mode,onceDelay,cycleDelay,cycleTime,arry}=obj
    let i=0
	obj.date=null
	obj.date=new Date()
	ipcRenderer.send("task-start",obj)
    while (i<cycleTime-obj.done && obj.unfinished ) {
        await runTask(onceTime,mode,arry,onceDelay,obj)
		obj.done++
		ipcRenderer.send("task-done-add",obj)
		if(cycleTime-obj.done==1 || !obj.unfinished){
			finishTask(obj)
			ipcRenderer.send("task-finished",obj)
		}
        await cycleInterval(cycleDelay)
      
    }
	
	}catch(err){
		console.log(err)
	}
}
/**
 * 
 * @param {obj} obj 任务对象
 */
exports.pauseTask=function (obj){
    obj.unfinished =false
	obj.date=null
	obj.date=new Date()
   
}
/**
 * 
 * @param {obj} obj 任务对象 
 */
exports.finishTask=function (obj){
    obj.unfinished=false
    obj=null
    
    
}
/**
 * 
 * @param {obj} obj 任务对象
 * @param {*} arry  文案数组
 */
exports.restartTask=function (obj){
	obj.unfinished =true
	let currenTime=new Date()
	let intervalTime=currenTime-obj.date
	if(intervalTime> obj.cycleDelay){
		startTask(obj)
	}
    
}
/**
 * 评论
 * @param {number} i 循环第几次 
 * @param {[]} arry  文案数组
 * @returns 
 */
function postMessege(i, arry,onceDelay) {
    return new Promise((resolve, reject) => {
       try{
		const timer = setTimeout(() => {
            let len = arry.length
            let index = i % len;
            document.querySelector("#Pl_Official_WeiboDetail__70 > div > div > div > div.WB_feed_handle > div > ul > li:nth-child(3) > a").click()
            document.querySelector("#Pl_Official_WeiboDetail__70 > div > div > div > div.WB_feed_repeat.S_bg1.WB_feed_repeat_v3 > div > div.WB_feed_publish.clearfix > div.WB_publish > div.p_input > textarea").value = arry[index]
            document.querySelector("#Pl_Official_WeiboDetail__70 > div > div > div > div.WB_feed_repeat.S_bg1.WB_feed_repeat_v3 > div > div.WB_feed_publish.clearfix > div.WB_publish > div.p_opt.clearfix > div.btn.W_fr > a").click(); 
            clearInterval(timer)
            resolve("comment")
        }, onceDelay)
	   }catch(err){
		   reject(err)
	   }


    })
}



function transMessege(i,arry,onceDelay) {
    return new Promise((resolve, reject) => {
       try{
		const timer = setTimeout(() => {
            let len = arry.length
            let index = i % len;
            document.querySelector("#Pl_Official_WeiboDetail__70 > div > div > div > div.WB_feed_handle > div > ul > li:nth-child(2) > a").click()
            document.querySelector("#Pl_Official_WeiboDetail__70 > div > div > div > div:nth-child(5) > div > div:nth-child(2) > div > div > div > div > div > div.p_input.p_textarea > textarea").value = arry[index]
            document.querySelector("#Pl_Official_WeiboDetail__70 > div > div > div > div:nth-child(5) > div > div:nth-child(2) > div > div > div > div > div > div.p_opt.clearfix > div.btn.W_fr > a").click()
            resolve("trans")
        }, onceDelay)
	   }catch(err){
		   reject(err)
	   }
    })
}

/**
 * 
 * @param {number} onceTime 每次任务的次数
 * @param {number} mode 任务模式 1为转发 其他为 评论
 * @param {*} arry 
 * @param {*} onceDelay 
 */
async function runTask(onceTime,mode,arry,onceDelay,obj) {
   try{
		for (var i = 0; i < onceTime; i++) {
			if(!obj.unfinished) return
				obj.doneTime++
				ipcRenderer.send("task-done-add",obj)
				if(mode==2){
					await postMessege(i, arry,onceDelay) 
				   }else{
					await transMessege(i,arry,onceDelay)
				   }
			
		 }
	
   }catch(err){
	throw new Error("任务错误")
   }
}


function cycleInterval(cycleDelay) {
  return  new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            clearInterval(timer)
            resolve()
        }, cycleDelay)
    })
}




/**
 * 新浪微博mid与url互转实用工具
 */
 
var WeiboUtility = {};
 
/**
 * 62进制字典
 */
WeiboUtility.str62keys = [
	"0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
	"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
	"A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
];
 
/**
 * 62进制值转换为10进制
 * @param {String} str62 62进制值
 * @return {String} 10进制值
 */
WeiboUtility.str62to10 = function(str62) {
	var i10 = 0;
	for (var i = 0; i < str62.length; i++)
	{
		var n = str62.length - i - 1;
		var s = str62[i];
		i10 += this.str62keys.indexOf(s) * Math.pow(62, n);
	}
	return i10;
};
 
/**
 * 10进制值转换为62进制
 * @param {String} int10 10进制值
 * @return {String} 62进制值
 */
WeiboUtility.int10to62 = function(int10) {
	var s62 = '';
	var r = 0;
	while (int10 != 0)
	{
		r = int10 % 62;
		s62 = this.str62keys[r] + s62;
		int10 = Math.floor(int10 / 62);
	}
	return s62;
};
 
/**
 * URL字符转换为mid
 * @param {String} url 微博URL字符，如 "wr4mOFqpbO"
 * @return {String} 微博mid，如 "201110410216293360"
 */
WeiboUtility.url2mid = function(url) {
	var mid = '';
	
	for (var i = url.length - 4; i > -4; i = i - 4)	//从最后往前以4字节为一组读取URL字符
	{
		var offset1 = i < 0 ? 0 : i;
		var offset2 = i + 4;
		var str = url.substring(offset1, offset2);
		
		str = this.str62to10(str);
		if (offset1 > 0)	//若不是第一组，则不足7位补0
		{
			while (str.length < 7)
			{
				str = '0' + str;
			}
		}
		
		mid = str + mid;
	}
	
	return mid;
};
 
/**
 * mid转换为URL字符
 * @param {String} mid 微博mid，如 "201110410216293360"
 * @return {String} 微博URL字符，如 "wr4mOFqpbO"
 */
WeiboUtility.mid2url = function(mid) {
	if (typeof(mid) != 'string') return false;	//mid数值较大，必须为字符串！
	
	var url = '';
	
	for (var i = mid.length - 7; i > -7; i = i - 7)	//从最后往前以7字节为一组读取mid
	{
		var offset1 = i < 0 ? 0 : i;
		var offset2 = i + 7;
		var num = mid.substring(offset1, offset2);
		
		num = this.int10to62(num);
		url = num + url;
	}
	
	return url;

}
function isMid(str){
	for(let a in str){
		if(str.charCodeAt(a)>64){
			return false
		}
	}
	if(!str){
		return false
	}else{
		return true
	}
}
function formatURL(url){
    url+=" "
   const matched= url.match(/(^https:\/\/\S+\/)(\d+\/)(\S+?)(\s|\?)/)
   if(!matched) return
   const str=matched[3]
   if(isMid(str)){
 return "https://weibo.com/"+matched[2] +WeiboUtility.mid2url(str)
   }else{
	   return matched[0]
   }
 }
exports.formatURL =formatURL