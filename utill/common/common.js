exports.selecOption = (arr) => {
    let str = " <option value='' class='remind-option'> --选择执行任务账号-- </option> "
    arr.forEach(item => {
        str += `<option value="${item.username}">${item.username}</option>`
    })
    return str
}

/**
 * 菜单
 * @param {object} obj {title:'',icon:'', class,children:[{title,icon,children},{}]} 最后没有children的给哈说值
 * @param {number} textIndent 后面的缩进多少个字符
 * @param {number} n 首个缩进多少字符
 * @returns 
 */
function menuSection(obj, textIndent = 1, n = 1, path = "") {
    let hash = obj.hash
    if (hash) {
        if (hash.search(/\//) > -1) {
            hash = hash.replace(/\//g, "")
        }
        hash = path + "/" + hash
    } else {
        hash = path
    }
    let str
    if (obj.icon && obj.title && obj.class) {
        str = `<div class="menu-title ${obj.class}" data-hash="${hash}"><div><i class=${obj.icon}></i><span>${obj.title}</span></div></div>`
    } else if (obj.title && obj.icon) {
        str = `<div class="menu-title" data-hash="${hash}"><div><i class=${obj.icon}></i><span>${obj.title}</span></div></div>`
    } else if (obj.title) {
        str = `<div class="menu-title " data-hash="${hash}"><div><span>${obj.title}</span></div></div>`
    }
    if (obj.children && obj.children.length > 0) {
        let str1 = ` <ul class='menu-list' style='height:0px ;overflow:hidden;text-indent: ${n}em;'>`
        obj.children.forEach(item => {
            str1 += "<li class=submenu-item >" + menuSection(item, textIndent, n + textIndent, hash) + "</li>"
        })
        str1 += "</ul>"
        str += str1

    } else {
        return str
    }
    return str
}
exports.menuSections = function (arr) {
    let str = ""
    arr.forEach(item => {
        str += menuSection(item)
    })
    return str
}
exports.tableTbody = function (arr) {
    let str = ""
    arr.forEach((item, index) => {
        str += `<tr>
        <td>${index + 1}</td>
        <td>${item.username}</td>
        <td><button class="detel-button" onclick="deteluser('${item.username}')">删除</button></td>
        </tr>`
    })
    return str
}
exports.textTableTbody = function (arr) {
    let str = ""
    arr.forEach((item, index) => {
        str += `<tr>
        <td>${index + 1}</td>
        <td colspan="2">${item}</td>
        <td><button class="button-default detel-button" onclick="deteltext(event)">删除</button></td>`
    })
    return str
}


class taskObj{
    constructor(url,username,onceTime,onceDelay,cycleDelay,cycleTime,taskmode,tasktext){
        
        this.url=url
        this.username=username
        this.onceTime=onceTime*1 || 10
        this.onceDelay=onceDelay*1000 || 5000
        this.cycleDelay=cycleDelay*60000 ||15*60000
        this.cycleTime=cycleTime*1  || 5
        this.unfinished=true
        this.done=0
        this.mode=taskmode || 2 
        this.arry=tasktext
        this.doneTime=0
        
    }

}

exports.taskObj=taskObj

exports.taskRender=function(arr,flag){
    let str=''
    arr.forEach((item,index)=>{
        str+=`<div class="task-contain" id="taskObjArr">
        <p style="padding: 5px;">
         <span style="color:#e60000;">任务${index+1}链接地址:</span>
         <span style="padding: 0 5px;">${item.url}</span>
         </p>
        <p style="padding: 5px;color: #2325bb "> 
        <span >完成进度${item.done} /${item.cycleTime}</span> 
        <span style="padding: 0 5px;">完成条数${item.doneTime}</span>
        </p>
        <p style="padding: 5px;">
        <span style="color:#e60000">执行账号:</span> 
        <span style="padding: 0 5px">${item.username}</span>
        </p>
        `
       
        if(flag!=="history"){
            str+=`<div> <button class=" button-default" onclick="finishOnceTask('${item.username}')">
            结束任务</button> <button class=" button-default" onclick="startOnceTask('${item.username}')">
            开始任务</button></div>
            </div> </div>`
        }else{
            str+=`<div> <button class=" button-default" onclick="detelHistoryTask('${index}')">
            删除任务</button></div>
            </div> </div>`
        }
    })
     
    return str
}