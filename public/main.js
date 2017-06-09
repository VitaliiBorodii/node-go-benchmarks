(() => {

  var outputElement = document.getElementById('output');

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
          outputElement.innerHTML += html;
        })
        .catch(reject);
    });
  };

  var calculate = (start, end) => {

    console.log(start, end)

    if (isNaN(start) || isNaN(end)) {
      return
    }

    var startTime = Date.now();
    var promises = [];
    for (let i = start; i <= end; i++) {
      console.log('bin(', i, ')');
      promises.push(bin(i))
    }

    outputElement.innerHTML = '';

    Promise.all(promises)
      .then((responses) => {
        console.log('Responses:');
        console.log(responses.map(r => r.response));
        const overallTime = responses.reduce((acc, r) => (acc + r.time), 0);
        let html = '<pre>';
        html += `<span class="result">Overall time: <u>${Date.now() - startTime}</u> ms</span>`;
        html += '<br>'
        html += `<span class="result">Summary time of all requests: <u>${overallTime}</u> ms</span>`;
        html += '</pre>';

        outputElement.innerHTML += html
      })
      .catch(console.error.bind(console));
  };

  const start = getQueryVariable('start');
  const end = getQueryVariable('end');

  document.getElementById('input-start').value = start;
  document.getElementById('input-end').value = end;
  calculate(Number(start), Number(end));

})();