const {session}=require("electron")

exports.getSession=(partition,options)=>{
    const ses = session.fromPartition(partition,options)
   return ses 
}
/**
 * 
 * @param {object} sessions session实例对象
 * @param {*} callback 
 */
exports.cleanSession=(sessions,callback)=>{
sessions.clearStorageData().then(()=>{
    callback()
//    sessions.cookies.get({},(c)=>{
//        console.log(c)
//    })
   sessions.clearCache()
})
}
