const { BrowserWindow } = require("electron")
const { session } = require("electron")
const { getSession } = require("./session")
const { cleanSession } = require("./session")
let sessionFlag = "weibo"

let num = {num:1}



//自定义创建子窗口----------------------------------------------------------------------------------------------------------------------
const createWindows = (mainWindow) => {
  // 打开新窗口是控制是否允许创建新窗口
  //   mainWindow.webContents.setWindowOpenHandler(({ url }) => {
  //     if (url === 'about:blank') {
  //       return {
  //         action: 'allow',
  //       }
  //     }
  //     return { action: 'deny' }
  //   })
  mainWindow.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
    event.preventDefault()
    num.num += 1
    const partitions = sessionFlag + num.num
    Object.assign(options, {
      width: 1000,
      height: 800,
      webPreferences: {
        partition: `${partitions}`

      },
    })
    event.newGuest = new BrowserWindow(options)
    event.newGuest.webContents.openDevTools()
    console.log(event.newGuest.webContents.getProcessId(), "windowopen")
    // session.defaultSession.cookies.get({}).then((cookie)=>{
    //     console.log(cookie)
    // })
    // getSession("mainwindow").cookies.get({}).then((cookie)=>{
    //     console.log(cookie)
    // })


  })
}

//新增窗口---------------------------------------------------------------------------------------------------------------------------------
const addWindows = (mainWindow, options) => {
  let count=0
  const partitions = sessionFlag + num.num
  const obj = Object.assign({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,//解决在渲染进程中require（）is not defined 报错，在我们常见渲染窗口的时候，允许集成node.js功能。
      contextIsolation: false,//electronV12将此默认值修改为了true,如果要解决渲染进程中require（）is not defined 报错，需要修改为false
      partition: `persist:${partitions}`

    },
  }, options)
  const addWindow = new BrowserWindow(obj)
  addWindow.openDevTools()
  // console.log(addWindow.webContents.getProcessId(), "addwindow",partitions)
 
  addWindow.loadURL("https://weibo.com/newlogin?tabtype=weibo&gid=102803&openLoginLayer=0&url=")

  addWindow.webContents.on("page-title-updated", (e, title) => {
    if (title === "我的首页 微博-随时随地发现新鲜事" && count < 1) {
      const code = `
                const {ipcRenderer}=require("electron")
                const username=document.querySelector("#skin_cover_s > div > a:nth-child(1)").title
                ipcRenderer.send("user-info",username)`
      addWindow.webContents.executeJavaScript(code).then(() => {
        count++
        // addWindow.hide()
      })
    }
  })
  return addWindow
}


module.exports = { createWindows, addWindows ,num }