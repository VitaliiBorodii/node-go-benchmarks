(() => {

  var output = document.getElementById('output');
  var input = document.getElementById('input-arg');
  var form = document.getElementById('form');

  var bin = (num) => {

    return new Promise((resolve, reject) => {
      setTimeout(() => {

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
      }, Math.round((Math.random() * 1000)));  //to emulate real-time experience
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
        const overallTime = responses.reduce((acc, r) => (acc + r.time), 0);
        let html = '<pre>';
        html += `<span class="result">Overall time: <u>${Date.now() - startTime}</u> ms</span>`;
        html += '<br>';
        html += `<span class="result">Summary time of ${responses.length} requests: <u>${overallTime}</u> ms</span>`;
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

  document.title = location.pathname
    .slice(1, -1)
    .split('-')
    .map(p => `${p[0].toUpperCase()}${p.slice(1)}`)
    .join(' ');

})();