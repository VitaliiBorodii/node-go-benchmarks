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
          var html = '<pre>';
          html += `<i>Binary tree (${num}) :</i>`;
          html += '</br>';

          response.time = Date.now() - t;
          if (ok) {
            response.response = r;
            r.forEach(row => {
              html += `<span>${row}</span>`;
            })
          } else {
            response.error = r;
          }
          resolve(response);
          html += '</pre>';
          html += '</hr>';
          outputElement.innerHTML += html;
        })
        .catch(reject);
    });
  };

  var calculate = (n) => {
    if (isNaN(n)) {
      return
    }


    var promises = [];
    for (let i = 0; i < n; i++) {
      promises.push(bin(i))
    }

    outputElement.innerHTML = '';

    Promise.all(promises)
      .then((responses) => {
        console.log('Responses:');
        console.log(responses.map(r => r.response));
        const overallTime = responses.reduce((acc, r) => (acc + r.time), 0);
        console.log('Overall time: ', overallTime / 1000, 's');
        outputElement.innerHTML += `<b>Overall requests time: ${overallTime} ms</b>`;
      })
      .catch(console.error.bind(console));
  };

  const n = getQueryVariable('iterations');
  calculate(n);

})();
