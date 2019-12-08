console.log("in script");

function gettalks()
{
    var url = "http://localhost:3000/talks";
    req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.onreadystatechange = callback;
    req.send(null);
}

function callback()
{
    if (req.readyState == 4) {
        if (req.status == 200) {
            var response = JSON.parse(req.responseText);
            var todolist = document.getElementById("talklist");
            todolist.innerHTML="";
            for (i = 0; i < response.length; i++) {
                var value = response[i];    // using ad-hoc object
                var node = document.createElement("li");                
                var textnode = document.createTextNode(value.title); 
                node.appendChild(textnode);  
                todolist.appendChild(node);
            }
        }
    }
}

window.onload = function(){
    gettalks();
}
