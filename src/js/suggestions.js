$(function(){
    var el_searchbox = document.getElementById("in-search");
    el_searchbox.oninput = newInput;
    el_searchbox.onpropertychange = el_searchbox.oninput;
})

function newInput() {
    var input_text = this.value;
    var _search_type = getSearchType();
}
