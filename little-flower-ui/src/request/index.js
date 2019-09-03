import Promise from 'es6-promise';
import fetch from 'isomorphic-fetch';
import queryString from 'query-string';
import apiConfig from './api';

const TIMEOUTLIMIT = 120000;

function getUrlencodedStr(obj) {
	return queryString.stringify(obj);
}
const embedFetch = (requestPromise, timeout = TIMEOUTLIMIT) => {
	let timeoutAction = null;
	const timerPromise = new Promise((resolve, reject) => {
		timeoutAction = () => {
			reject(new Error('请求超时'));
		};
	});
	setTimeout(() => {
		timeoutAction();
	}, timeout);
	return Promise.race([requestPromise, timerPromise]);
};

function status(response) {
	if (response.status >= 200 && response.status < 300) {
		return Promise.resolve(response);
	} else if (response.status === 401) {
		
	}
	return Promise.reject(new Error(response.statusText));
}

function json(response) {
	return response.json();
}

export function getData(url, queryObj = {}) {
	const reqHeader = {
		method: 'GET',
		credentials: 'include',
		mode: 'cors',
		headers: {
			Accept: 'application/json, text/plain, */*'
		},
	};
	const myFetch = fetch(`${url}?${queryString.stringify(queryObj)}`, reqHeader);
	return new Promise((resolve, reject) => {
		embedFetch(myFetch, TIMEOUTLIMIT)
			.then(status)
			.then(json)
			.then((responseData) => {
				resolve(responseData);
			})
			.catch((error) => {
				console.warn('服务器连接错误，请稍后再试');
				reject(error);
			});
	});
}

// export async function syncGetData(url, queryObj = {}, type) {
// 	const reqHeader = {
// 		method: 'GET',
// 		credentials: 'include',
// 		mode: 'cors',
// 		headers: {
// 			Accept: 'application/json, text/plain, */*'
// 		},
// 	};
// 	const myFetch = fetch(`${url}?${queryString.stringify(queryObj)}`, reqHeader);
// 	const data = await fetchData(myFetch);
//     return data;
// }

function fetchData(myFetch){
	return new Promise((resolve, reject) => {
		embedFetch(myFetch, TIMEOUTLIMIT)
			.then(status)
			.then(json)
			.then((responseData) => {
				return resolve(responseData);
			})
			.catch((error) => {
				console.warn('服务器连接错误，请稍后再试');
				return reject(error);
			});
	});
}

export function postJsonData(url, queryObj = {}) {
	const reqJson = {
		method: 'POST',
		body: JSON.stringify(queryObj),
		mode: 'cors',
		credentials: 'include',
		headers: {
			Accept: 'application/json, text/plain, */*'
		},
	};
	reqJson.headers['Content-Type'] = 'application/json; charset=utf-8';

	const myFetch = fetch(url, reqJson);

	return new Promise((resolve, reject) => {
		embedFetch(myFetch, TIMEOUTLIMIT)
			.then(status)
			.then(json)
			.then((responseData) => {
				resolve(responseData);
			})
			.catch((error) => {
				console.warn('服务器连接错误，请稍后再试');
				reject(error);
			});
	});
}

/**
 * POST 请求
 * Content-Type application/x-www-form-urlencoded
 * */
export function postUrlencodedData(url, queryObj = {}) {
	const reqJson = {
		method: 'POST',
		body: getUrlencodedStr(queryObj),
		mode: 'cors',
		credentials: 'include',
		headers: {
			Accept: '*/*'
		},
	};
	reqJson.headers['Content-Type'] = 'application/x-www-form-urlencoded'
	const myFetch = fetch(url, reqJson);
	return new Promise((resolve, reject) => {
		embedFetch(myFetch, TIMEOUTLIMIT)
			.then(status)
			.then(json)
			.then((responseData) => {
				resolve(responseData);
			})
			.catch((error) => {
				console.warn('服务器连接错误，请稍后再试');
				reject(error);
			});
	});
}


export function clearRequestParam(param) {
	for (let i in param) {
		if (typeof param[i] === 'undefined')
			delete param[i];
		else if (typeof param[i] === 'string' && param[i] === '') {
			delete param[i];
		}
	}
	return param;
}

export function getUrlWithPathParam(url, pathParams) {
	pathParams.forEach((item) => {
		url = url.replace('{' + item.key + '}', item.value);
	});
	return url;
}

function getApi() {
	return apiConfig;
}
export const api = getApi();

