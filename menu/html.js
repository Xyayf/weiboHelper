/**
 * 
 * @param {object} obj {title:'',icon:'',hash class,children:[{title,icon,children},{}]}
 * @param {number} textIndent 后面的缩进多少个字符
 * @param {number} n 首个缩进多少字符
 * @param {*} path 
 * @returns 
 */
 function menuSection(obj,textIndent=1,n=1,path=""){
    let hash=obj.hash
       if(hash){
        if(hash.search(/\//)>-1){
            hash=hash.replace(/\//g,"")
        }
        hash=path+"/"+hash
       }else{
           hash=path
       }
       let str
       if(obj.icon && obj.title && obj.class ){
        str=`<div class="menu-title ${obj.class}" data-hash="${hash}"><div><i class=${obj.icon}></i><span>${obj.title}</span></div></div>`
   }else if(obj.title && obj.icon){
        str=`<div class="menu-title" data-hash="${hash}"><div><i class=${obj.icon}></i><span>${obj.title}</span></div></div>`
   }else if(obj.title){
        str=`<div class="menu-title " data-hash="${hash}"><div><span>${obj.title}</span></div></div>`
   }
       if(obj.children && obj.children.length>0){
           let str1=` <ul class='menu-list' style='height:0px ;overflow:hidden;text-indent: ${n}em;'>`
           obj.children.forEach(item=>{
             str1+= "<li class=submenu-item >"+menuSection(item,textIndent ,n+textIndent,hash)+"</li>"
           })
           str1+="</ul>"
           str+=str1
   
       }else{
         return str
       }
   return str
   }
exports.menuSections=function(arr){
 let str=""
 arr.forEach(item=>{
    str+= menuSection(item)
 })
 return str
}