// import cookie from 'js-cookie';
import notice from 'modules/notice';
import server from './index';

// var token = cookie.get('token');
var relogin_code = [10004, 10003];

export var server_name = process.env.NODE_ENV === 'development' ?
                        'http://connect-island.1900lab.com/v1/'
                      : process.env.REQUEST_URL;

function logout(code) {
    cookie.set('errcode', code || 'no errcode');
    cookie.set('old_token', cookie.get('token') || 'no cookie');
    cookie.remove('token');
    if(window.location.pathname != '/'){
        window.location.href = '/';
    }
}

function handleResponse(res, request_path) {
    return new Promise(function (resolve, reject) {
        if(res) {
            resolve(res.json());
        } else {
            reject();
        }
    }).then(function (data) {
        if(data.errcode === 0){
            return data.result;
        } else if(relogin_code.includes(data.errcode)){
            logout(data.errcode);
        }else {
            return Promise.reject(data.errmsg);
        }
    })
}

export function get(url, params = {}, config = {error: true}) {
    function finish() {
        if(config.loading){
            clearTimeout(loading_timer);
            notice.hide_loading();
        }
    }

    var loading_timer;
    if(config.loading){
        loading_timer = setTimeout(function () {
            notice.show_loading();
        }, 500);
    }

    params.token = params.token || cookie.get('token');
    return server.get(/http/.test(url) ? url : server_name + url, params)
        .then(function (res) {
            finish();
            return handleResponse(res, url);
        })
        .catch(function (msg) {
            var error = config.error;
            error && notice.push_error(
                typeof error === 'string' ? error : msg );
            finish();
            return Promise.reject(msg);
        });
};

export function post(url, params = {}, config = {error: true}) {
    function finish() {
        if(config.loading){
            clearTimeout(loading_timer);
            notice.hide_loading();
        }
    }

    var loading_timer;
    if(config.loading){
        loading_timer = setTimeout(function () {
            notice.show_loading();
        }, 200);
    }
    params.token = params.token || cookie.get('token');

    return server.post(/http/.test(url) ? url : server_name + url, params)
        .then(function (res) {
            finish();
            if(typeof res === 'object'){
                return handleResponse(res, url);
            }
        })
        .catch(function (msg) {
            var error = config.error;
            error && notice.push_error(
                typeof error === 'string' ? error : msg );
            finish();
            return Promise.reject(msg);
        })
}

export function form(url, params = {},config={error: true}){
    var request_server = config.public ? public_name : server_name;
    params.token = params.token || cookie.get('token');
    return server.form(request_server + url, params)
        .then(function (res) {
            return handleResponse(res, url);
        })
        .catch(function (msg) {
            console.error('error ' + url + ' ' + msg);
            return Promise.reject(msg);
        });
}

export default {
    get,
    post,
    form
}
