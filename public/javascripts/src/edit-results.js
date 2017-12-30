(function(w,d){

  function dta(elems, fn){
    let len = elems.length, i = -1
    while(++i < len){
      fn(elems[i])
    }
  }

  function makeRequest (method, path, content, content_type = "application/json;charset=UTF-8") {
    return new Promise((resolve, reject) => {
      let req = new XMLHttpRequest();

      req.open(method, path);
      //req.setRequestHeader("Authorization", `${authtype} ${token}`);
      req.setRequestHeader("Content-type", content_type);

      req.onload = function() {
        if (this.status >= 200 && this.status < 300) {
          let resp = req.response && req.response.length ? req.response : req.responseText
          resolve(resp);
        } else {
          reject({
            status: this.status,
            statusText: req.statusText
          });
        }
      }
      req.onerror = function() {
        reject({
          status: this.status,
          statusText: req.statusText
        });
      }
      if (method === "GET" || !content) {
        req.send();
      } else {
        req.send(content);
      }
    })
  }

  function addReplaceFunctionality(elem){
    let replaceButton = d.createElement('SPAN')

    replaceButton.className = 'replaceButton'
    replaceButton.textContent = 'Replace Tab'

    replaceButton.addEventListener('click', e => {
      var newURL = w.prompt("Replace with tab at URL: ")
      if(newURL){
        makeRequest('POST', '/replace-tab', JSON.stringify({url: newURL})).then(data => {
          if(!data.error){
            elem.querySelector('div').innerHTML = JSON.parse(data).tab
          }
        })
      }
    })

    elem.appendChild(replaceButton)
  }

  dta(d.querySelectorAll('.tab-inner'), t => addReplaceFunctionality(t))

  d.querySelector('label').addEventListener('click', function(){
    addReplaceFunctionality(this)
  })

  d.getElementById('Download').addEventListener('click', e => {

    var tabhtml = d.getElementById('output').innerHTML

    makeRequest('POST', '/create-pdf', JSON.stringify({html: tabhtml})).then(data => {
      if(!data.error){
        var filename = [w.location.protocol, '//', w.location.host, JSON.parse(data).filename].join("")
        console.log(filename)
        w.location.href = filename
      }
    })
  })
}(window, document))