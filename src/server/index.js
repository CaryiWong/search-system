import $ from 'jquery'

function serialize(obj, prefix) {
    var str = [];
    for(var p in obj) {
        var value = obj[p];
        if (obj.hasOwnProperty(p) && (value !== null && value !== undefined)) {
            var k = prefix ? prefix + "[" + p + "]" : p;
            str.push(typeof value == "object" ?
            serialize(value, k) :
            encodeURIComponent(k) + "=" + encodeURIComponent(value));
        }
    }
    return str.join("&");
}

export function get(url, data = {}) {
    return $.ajax({
      xhrFields: {
        withCredentials: true
      },
        type: 'GET',
        url: url,
        data: data,
        dataType: "json"
    });
}

export function post(url, data = {}){
  return $.ajax({
    xhrFields: {
      withCredentials: true
    },
    type: 'post',
    url: url,
    data: data,
    dataType: "json"
  });
}

export function form(url,file) {
  // var dtd = $.Deferred();
  if (file) {
    if (typeof FormData === "undefined") {
      throw new Error("FormData is not implemented");
    }
    var request = new XMLHttpRequest();
    request.open('POST', url);
    request.onreadystatechange = function () {
      if (request.readyState === 4 && request.status === 200 && request.responseText !== '') {
        var data = JSON.parse(request.responseText).data;
        dtd.resolve(data);
      } else if (request.status !== 200 && request.responseText) {
        var error = JSON.parse(request.responseText);
        dtd.reject(error)
      }
    };
    var formdata = new FormData();
    // if (typeof (file) === 'object') {
      formdata.append('file', file);
      request.send(formdata);
    // } else {
    //   compressImg(file, 960, function (src) {
    //     formdata.append('img', src);
    //     request.send(formdata);
    //   });
    // }
    return dtd.promise();
  }
}


export default {
    get,
    post,
    form
};
