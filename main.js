
const { app, BrowserWindow, Menu, Tray, BrowserView, ipcMain, dialog, Notification, session, ipcRenderer } = require('electron')
const path = require('path')
const { addWindows, createWindows} = require("./utill/mian/window")
const { getSession, cleanSession } = require("./utill/mian/session")
let {num}=require("./utill/mian/window")
const isMac = process.platform === 'darwin'
//账号信息
let IDobj = []
let Notifications
//创建主窗口-----------------------------------------------------------------------
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,//解决在渲染进程中require（）is not defined 报错，在我们常见渲染窗口的时候，允许集成node.js功能。
      contextIsolation: false,//electronV12将此默认值修改为了true,如果要解决渲染进程中require（）is not defined 报错，需要修改为false
      webSecurity: false,//同源策略跨域问题
      webviewTag: true,//是否启用webview标签
      preload: path.join(__dirname, 'preload.js')
    },
  })
  //   打开开发工具
  mainWindow.webContents.openDevTools()
  // console.log(mainWindow.webContents.getProcessId(), "mianwidow")

  //监听从渲染进程传入的消息-------------------------------------------------------
  //增加窗口
  // createWindows(mainWindow)
  let addWin
  let addsucess=true
  ipcMain.on("add-new-window", () => {
  if (addsucess){
    addsucess=false
    addWin= addWindows(mainWindow)
  }
 
  })
   //监听从三方传入的用户名---------------------------------------------------------
   ipcMain.on("user-info", (e, userInf) => {
    
    const doHave=IDobj.find(item=>{
      return item.username==userInf
    })
    if(!doHave){
      const obj = { username: userInf, webcontent: e.sender }
    IDobj.push(obj)
    const arr = IDobj.map(item => ({ username: item.username }))
    num.num++
    mainWindow.send("new-user-info", arr)
    addsucess=true
    addWin.hide()
    }else{
      cleanSession(addWin.webContents.session,function(){
        Notifications.title = "添加失败"
        Notifications.subtitle = "重复添加用户"
        Notifications.show()
        addWin.destroy()
        
      })
      
    }
    
  })
  
  //监听mainWindow账号管理传入的删除用户信息-----------------------------------------
  ipcMain.on("detel-user", (e, val) => {
    const deteluserIndex = IDobj.findIndex(item => {
      return item.username === val
    })
    const targetuser = IDobj[deteluserIndex]
    cleanSession(targetuser.webcontent.session, () => {
      Notifications.title = "删除用户"
      Notifications.subtitle = targetuser.username + "删除成功"
      Notifications.show()
      IDobj.splice(deteluserIndex, 1)
      const arr = IDobj.map(item => ({ username: item.username }))
      mainWindow.send("new-user-info", arr)
    })

  })
  //监听开始全部开始任务-------------------------------------------------------------
  let taskObjArr = []
  ipcMain.on("all-start-task", (e, taskObjarr) => {
    taskObjArr = taskObjarr
    taskObjArr.forEach(taskItem => {
      const targetIDobj = IDobj.find((IDItem) => {
        return taskItem.username == IDItem.username
      })
      let str = "{"
      Object.keys(taskItem).forEach((item, index) => {
        if (typeof taskItem[item] == "string") {
          str += `${item}:"${taskItem[item]}",`
        } else if (Array.isArray(taskItem[item])) {
          let arry = "["
          taskItem[item].forEach(arr => {
            arry += `"${arr}",`
          })
          arry += "]"
          str += `${item}:${arry},`
        }else{
          str+=`${item}:${taskItem[item]},`
        }
      })
      str += "}"
      targetIDobj.webcontent.loadURL(taskItem.url)
      targetIDobj.webcontent.openDevTools()
      targetIDobj.webcontent.executeJavaScript(` 
    const {startTask,pauseTask,finishTask,restartTask}=require("./weibo")
   let obj=${str}
   setTimeout(()=>{

    startTask(obj)
   },1000)
    `
      )
      //暂停所有任务--------------------------------------------------------
      ipcMain.on("all-task-pause", () => {
        targetIDobj.webcontent.executeJavaScript(`

  pauseTask(obj)
  `)

      })
      //重启所有任务------------------------------------------------------------------------
      ipcMain.on("all-take-restart", () => {

        targetIDobj.webcontent.executeJavaScript(`

    restartTask(obj)
    `)

      })
      //结束左右任务-----------------------------------------------------------------------
      ipcMain.on("all-task-finish", () => {
        targetIDobj.webcontent.executeJavaScript(`

  finishTask(obj)
  `)

      })

    })

  })

  //某一任务开始----------------------------------------------------------------------
  ipcMain.on("once-take-start",(e,taskobj)=>{
    let str="{"
    Object.keys(taskobj).forEach((item, index) => {
      if (typeof taskobj[item] == "string") {
        str += `${item}:"${taskobj[item]}",`
      } else if (Array.isArray(taskobj[item])) {
        let arry = "["
        taskobj[item].forEach(arr => {
          arry += `"${arr}",`
        })
        arry += "]"
        str += `${item}:${arry},`
      }else{
        str+=`${item}:${taskobj[item]},`
      }
    })
    str += "}"
    const targetIDobj=IDobj.find(item=>{
      return item.username==taskobj.username
    })
    targetIDobj.webcontent.loadURL(taskobj.url)
    targetIDobj.webcontent.openDevTools()
    targetIDobj.webcontent.executeJavaScript(` 
  const {startTask,pauseTask,finishTask,restartTask}=require("./weibo")
 let obj=${str}

  startTask(obj)
 
  `
    )
  })
  //某一任务结束------------------------------------------------------------------
ipcMain.on("once-task-finish",(e,taskobj)=>{
  const targetIDobj=IDobj.find(item=>{
    return item.username==taskobj.username
  })
  targetIDobj.webcontent.executeJavaScript(`

  finishTask(obj)
  `)
})

  //隐藏所有窗口/任务--------------------------------------------------------------
  ipcMain.on("all-task-hidden", (e) => {
    BrowserWindow.getAllWindows().forEach(item => {
      item.hide()
    })
    mainWindow.show()
  })
  //显示所有窗口/任务---------------------------------------------------------------
  ipcMain.on("all-task-show", () => {
    BrowserWindow.getAllWindows().forEach(item => {
      item.show()
    })
  })

  //监听到任务完成 删除对应的任务对象-----------------------------------------------------------------------回
  ipcMain.on("task-finished", (e, taskobj) => {
    Notifications.title = "任务完成信息"
    Notifications.subtitle = taskobj.username + "账号任务完成"
    Notifications.show()
    const index = taskObjArr.findIndex(item => {
      return item.username = taskobj.username
    })
    mainWindow.send("finished-taskobj", taskobj)
    taskObjArr.splice(index, 1)
    const timer = setTimeout(() => {
      mainWindow.send("render-task-data", taskObjArr)
      clearTimeout(timer)
    }, 5000)

  })

  //监听任务完成一次done改变一次，改变对应的任务对象渲染页面--------------------------------------------------回
  ipcMain.on("task-done-add", (e, taskobj) => {
    const index = taskObjArr.findIndex(item => {
      return item.username == taskobj.username
    })
    taskObjArr.splice(index, 1, taskobj)
    mainWindow.send("render-task-data", taskObjArr)

  }
  )
  //监听到任务开始了--------------------------------------------------------------------------------------回
  ipcMain.on("task-start", (e, taskobj) => {
    const index = taskObjArr.findIndex(item => {
      return item.username = taskobj.username
    })
    taskObjArr.splice(index, 1, taskobj)
    mainWindow.send("render-task-data", taskObjArr)
  })

  mainWindow.loadFile("pages/index.html")
}



/**--------------------------------------------------------app应用加载ready--------------------------------------------- */


app.whenReady().then(() => {
  Notifications = new Notification({
    title: "这是一个通知",
    subtitle: '这个是副标题',
    body: '',
    slient: true,
    hasReply: true
  })
  createWindow()

  /**-------------------------------------------------------app应用activate-------------------------------------------- */
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()

  })

})
/**--------------------------------------app应用所有窗口关闭---------------------------------------------------------- */
app.on('window-all-closed', () => {
  const allWindows = BrowserWindow.getAllWindows()
  setTimeout(() => {
    app.quit()
  }, 1000)
})

// In this file you can include the rest of your app's specific main process
// code. 也可以拆分成几个文件，然后用 require 导入。
// ipcMain.on('show-context-menu', (event) => {
//   const template = [
//     {
//       label: 'Menu Item 1',
//       type: 'checkbox',
//       checked: false,
//       click: () => { event.sender.send('context-menu-command', 'menu-item-1') }
//     },
//     { type: 'separator' },//分割线
//     { label: 'Menu Item 2', type: 'checkbox', checked: true }
//   ]
//   const menu = Menu.buildFromTemplate(template)

//   menu.popup(BrowserWindow.fromWebContents(event.sender))
  //以下代码不能改变在视图层面改变checked
  // ipcMain.on("change-menu", (e, val) => {
  //   //   menu.items.forEach(item=>{
  //   //       item.checked=false
  //   //       if(item.label===val){
  //   //           item.checked=true
  //   //       }
  //   //   })
  //   //   console.log(menu)


  //   Notifications.show()
  // })

// })







