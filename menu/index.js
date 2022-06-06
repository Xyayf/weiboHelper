function forEeachArrlike(DOM, callback, evenName = "click") {
    for (let i = 0; i < DOM.length; i++) {
        DOM[i].addEventListener(`${evenName}`, callback)
    }
}
document.addEventListener("DOMContentLoaded",function(){
    function forEeachArrlike(DOM, callback, evenName = "click") {
        for (let i = 0; i < DOM.length; i++) {
            DOM[i].addEventListener(`${evenName}`, callback)
        }
    }
    const titleDOM = document.querySelectorAll(".menu-title")
    forEeachArrlike(titleDOM, function () {
        for (let i = 0; i < titleDOM.length; i++) {
            titleDOM[i].style.background = ""
        }
        this.style.background = "var(--menuactivety)"
        const childrenDom = this.nextElementSibling
        if (childrenDom) {
            if (childrenDom.style.height == "0px") {
                childrenDom.style.height = "auto"
            } else {
                childrenDom.style.height = "0px"
            }
        } else {
            window.location.hash = this.dataset["hash"]
            
        }

    })
})