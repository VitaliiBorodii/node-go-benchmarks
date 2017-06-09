(() => {

  var output = document.getElementById('output');
  var input = document.getElementById('input-arg');
  var form = document.getElementById('form');

  var getQueryVariable = (variable) => {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (decodeURIComponent(pair[0]) == variable) {
        return decodeURIComponent(pair[1]);
      }
    }
  };

  var bin = (num) => {

    return new Promise((resolve, reject) => {
      const t = Date.now();
      let ok;

      const response = {
        argument: num,
        response: null,
        time: null,
        error: null
      };

      fetch(`/bench${location.pathname}${num}`)
        .then((r) => {
          ok = r.ok;
          return ok ? r.json() : r.text()
        })
        .then((r) => {
          response.time = Date.now() - t;
          var html = '<pre><details>';
          html += '<summary>';
          html += `<span class="result">Result(${num}): </span>`;
          html += `<span class="result-yellow">${response.time} ms</span>`;
          html += '</summary>';
          html += '<br>';

          if (ok) {
            response.response = r;
            r.forEach(row => {
              html += `<span>${row}</span>`;
            })
          } else {
            response.error = r;
            html += `<span class="result-red">${r}</span>`;
          }
          resolve(response);
          html += ``;
          html += '</details></pre>';
          html += '<hr>';
          output.innerHTML += html;
        })
        .catch(reject);
    });
  };

  var prevent = (e) => {
    e.preventDefault();
  };

  var calculate = (e) => {

    var args = input.value.split(',');
    var startTime = Date.now();

    var promises = args.map(arg => bin(arg.trim()));

    output.innerHTML = '';

    if (!promises.length) {
      return
    }

    form.removeEventListener('submit', calculate);

    Promise.all(promises)
      .then((responses) => {
        console.log('Responses:');
        console.log(responses);
        let html = '<pre>';
        html += `<span class="result"><b>Overall time: <u>${Date.now() - startTime}</u> ms</b></span>`;
        html += '</pre>';

        output.innerHTML += html;
        form.addEventListener('submit', calculate);
      })
      .catch(err => {
        console.error(err);
        form.addEventListener('submit', calculate);
      });
  };

  form.addEventListener('submit', prevent);
  form.addEventListener('submit', calculate);

})();