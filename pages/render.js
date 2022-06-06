const { ipcRenderer, ipcMain } = require('electron')
const { selecOption, menuSections, tableTbody, textTableTbody, taskObj, taskRender } = require("../utill/common/common")
const { setItem, getItem } = require("../utill/common/localStorage")
const { formatURL } = require("../weibo")
const json = require("../Datajson/ui.json")
let commentText = getItem("comment") || require("../Datajson/comment.json")
let transmitText = getItem("transmit") || require("../Datajson/transmit.json")

let textmode = "comment"
let accoutArr = []
let text
let taskHistory =  getItem("taskHistory") || []


/** --------------------------账号设置------------------------------- */

//删除账号按钮
function deteluser(val) {
    ipcRenderer.send("detel-user", val)
}


/** -----------------------文案设置 ---------------------------------- */

//文案设置模式切换----------------
const texttableTbody = document.querySelector(".text-table-tbody")
function switchMode(e) {
    const dom = e.target
    const mode = dom.dataset["mode"]
    dom.style.backgroundColor = "#e2b2f9"
    dom.style.color = "#000"
    if (mode == "comment") {
        text = commentText
        dom.nextElementSibling.style.backgroundColor = ""
        dom.nextElementSibling.style.color = "#fff"
    } else {
        text = transmitText
        dom.previousElementSibling.style.backgroundColor = ""
        dom.previousElementSibling.style.color = "#fff"
    }
    textmode = mode
    const elem = textTableTbody(text)
    texttableTbody.innerHTML = elem
}

//删除当前行文本----------------------
function deteltext(e) {
    //删除数据
    const index = parseInt(e.target.parentNode.parentNode.children[0].innerHTML) - 1
    text.splice(index, 1)
    if (textmode == "comment") {
        commentText = text
        setItem("comment", commentText)
    } else {
        transmitText = text
        setItem("transmit", transmitText)
    }
    //移除dom
    const elem = textTableTbody(text)
    texttableTbody.innerHTML = elem

}

//input添加文案----------------------------
const textInputDom = document.querySelector(".text-input")
function inputAddtext() {
    const val = textInputDom.value
    if (!val) return
    if (textmode == "comment") {
        commentText.unshift(val)
        setItem("comment", commentText)
        text = commentText
    } else {
        transmitText.unshift(val)
        setItem("transmit", transmitText)
        text = transmitText
    }
    const elem = textTableTbody(text)
    texttableTbody.innerHTML = elem
}
function inputDeteltext() {
    textInputDom.value = ""
}



/** ----------------------------------- 任务管理 --------------------------  */
let taskmode = 2 //2为评论，其他数为转发
let tasktext = commentText //默认为评论
let taskObjArr = []
function taskMode(e) {
    const dom = e.target
    const mode = dom.dataset["mode"]
    dom.style.backgroundColor = "#e2b2f9"
    dom.style.color = "#000"
    if (mode == 2) {
        tasktext = commentText
        dom.nextElementSibling.style.backgroundColor = ""
        dom.nextElementSibling.style.color = "#fff"
    } else {
        tasktext = transmitText
        dom.previousElementSibling.style.backgroundColor = ""
        dom.previousElementSibling.style.color = "#fff"
    }
    taskmode = mode
    
}


//创建任务对象---------------------------------
const taskRenderDom = document.querySelector(".task-render")
function createTask() {
    let url = document.querySelector("#url").value
    const username = document.querySelector("#username").value
    const onceTime = document.querySelector("#onceTime").value
    const onceDelay = document.querySelector("#onceDelay").value
    const cycleDelay = document.querySelector("#cycleDelay").value
    const cycleTime = document.querySelector("#cycleTime").value
    const formaturl = formatURL(url)
    if (formaturl) {
        url = formaturl
    } else {
        return
    }
    if (!username) return
    let newTask = new taskObj(url, username, onceTime, onceDelay, cycleDelay, cycleTime, taskmode, tasktext)
    const unexit = taskObjArr.every(item => {
        return item.username != newTask.username
    })
    if (unexit) {
        taskObjArr.push(newTask)
    } else {
        newTask = null
    }
    let renderDOM = taskRender(taskObjArr)
    taskRenderDom.innerHTML = renderDOM

}
//开始所有任务----------------------------------
let isStart=false
let isPause=false
function startTask() {
    isStart=true
    if (taskObjArr.length < 0) return
    ipcRenderer.send("all-start-task", taskObjArr)

}
//暂停所有任务
function pauseTask() {
    if (!isStart) return
    isPause=true
    ipcRenderer.send("all-task-pause")
}
//重启所有任务
function restartTask() {
    if (!isStart || !isPause) return
    isPause=false
    ipcRenderer.send("all-take-restart")
}
//结束所有任务
function finishTask() {
    if (!isStart) return
    ipcRenderer.send("all-task-finish")
    isStart=false
}
//隐藏所有任务-----------------------------------
function hidenTask() {
    
    ipcRenderer.send("all-task-hidden")
}
//显示所有任务-----------------------------------
function showTask() {
   
    ipcRenderer.send("all-task-show")
}
// 开始某一个任务

function startOnceTask(username){
    const taskobj=taskObjArr.find(item=>{
      return  item.username==username
    })
    if(taskobj.date) return
    ipcRenderer.send("once-take-start",taskobj)
}

//结束某一任务

function finishOnceTask(username){
    const taskobj=taskObjArr.find(item=>{
      return  item.username==username
    })
    if(!taskobj.date) return
    ipcRenderer.send("once-task-finish",taskobj)
}

//删除历史记录
function detelHistoryTask(index){
    taskHistory.splice(index,1)
    setItem("taskHistory",taskHistory)
        const renderDOM = taskRender(taskHistory,"history")
        document.querySelector(".history_task").innerHTML = renderDOM
}

//----------------------------------------------文档加载后------------------------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function (e) {
    /** ---------------------------菜单 -----------------------------*/
    const menu = document.querySelector(".menu")
    const manage = document.querySelector(".manage_account")
    const text = document.querySelector(".setting_text")
    const history = document.querySelector(".history_task")
    const task = document.querySelector(".task_manage")
    const start = document.querySelector(".start-page")
    const arr = [manage, text, history, task]
    function displayNone() {
        arr.forEach(item => {
            item.style.display = "none"
        })
    }
    function displayBlock(ele) {
        ele.style.display = "block"
    }
    displayNone()
    window.addEventListener('hashchange', function () {
        start.style.display = "none"
        let hash = window.location.hash
        if (hash) {
            hash = hash.replace(/^#/, "")
            if (hash == manage.dataset["hash"]) {
                displayNone()
                displayBlock(manage)
            } else if (hash == text.dataset["hash"]) {
                displayNone()
                displayBlock(text)
            } else if (hash == history.dataset["hash"]) {
                displayNone()
                displayBlock(history)
            } else if (hash == task.dataset["hash"]) {
                displayNone()
                displayBlock(task)
            }
        } else {
            displayBlock(start)
        }

    }, false);
    menuItem = menuSections(json)
    menu.innerHTML = menuItem

    /** -----------------------------账号管理功能 -----------------------*/
    //添加账号按钮
    document.getElementById("addWindow").addEventListener("click", () => {
        ipcRenderer.send('add-new-window')
        ipcRenderer.on("new-user-info", (e, infoArr) => {
            accoutArr = infoArr
            //渲染账号管理的table
            const tableTbodyDOM = document.querySelector(".table-tbody")
            const dom = tableTbody(accoutArr)
            tableTbodyDOM.innerHTML = dom
            //渲染任务管理的选择账号
            const taskSelectDOM = document.getElementById("username")
            taskSelectDOM.innerHTML = selecOption(accoutArr)
        })
    })
    /** -----------------文案默认评论显示 -----------------------------------*/
    const buttonComment = document.querySelector(".comment")
    buttonComment.style.backgroundColor = "#e2b2f9"
    buttonComment.style.color = "#000"
    const elem = textTableTbody(commentText)
    texttableTbody.innerHTML = elem

    /** -----------------------------任务管理------------------------------*/
    //默认模式为评论 
    const buttonTaskComment = document.querySelector(".task-mode-comment")
    buttonTaskComment.style.backgroundColor = "#e2b2f9"
    buttonTaskComment.style.color = "#000"
    //默认选择账号
    const taskSelectDOM = document.getElementById("username")
    taskSelectDOM.innerHTML = selecOption(accoutArr)
    //默认创建任务后渲染

    //监听任务运行过程中数据变化后的数据动态渲染
    ipcRenderer.on("render-task-data", (e, renderdata) => {
        const renderDOM = taskRender(renderdata)
        taskObjArr = renderdata
        
        taskRenderDom.innerHTML = renderDOM
    })
    //默认历史记录渲染
    document.querySelector(".history_task").innerHTML =taskRender(taskHistory,"history")

    //监听某个任务完成后,存入历史记录里面
    ipcRenderer.on("finished-taskobj", (e, taskobj) => {
        
        taskHistory.unshift(taskobj)
        if (taskHistory.length > 20) {
            taskHistory.length = 20
        }
        setItem("taskHistory",taskHistory)
        const renderDOM = taskRender(taskHistory,"history")
        document.querySelector(".history_task").innerHTML = renderDOM
    })

})



// window.addEventListener('contextmenu', (e) => {
//     e.preventDefault()

//     ipcRenderer.send('show-context-menu')

// })
// ipcRenderer.on('context-menu-command', (e, command) => {
//     ipcRenderer.send('change-menu', "Menu Item 1")
// })

// document.getElementById("show").addEventListener("click",()=>{
//     window.open("https://weibo.com/")

// })


// document.getElementById("showAllWindow").addEventListener("click",()=>{
//     ipcRenderer.send('show-all-window')

// })
// document.getElementById("targetLink").onchange=function(e){
//     console.log(e.target.value,selectDom.value)
//     ipcRenderer.send("send-target-link",e.target.value,selectDom.value)
// }

