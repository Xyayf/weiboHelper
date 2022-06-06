exports.setItem=function(key,val){
    if(typeof val=="object" &&val!=null){
        val=JSON.stringify(val)
    }
    window.localStorage.setItem(key,val)
}
exports.getItem=function(key){
    let val=window.localStorage.getItem(key)
    try{
        return JSON.parse(val)
    }catch(err){
        return val 
    }
}
exports.removeItem=function(key){
    window.localStorage.removeItem(key)
}
exports.clearAll=function(){
    window.localStorage.clear()
}
