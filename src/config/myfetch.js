var baseUrl = 'http://127.0.0.1:8082/';

export default async (url = '', data = {}, type = 'POST') => {
    url = baseUrl + url;
    let requestConfig = {
        // credentials: 'include',
        method: type,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        mode: "cors",
        cache: "force-cache"
    }
    if (type === 'GET') {
        //数据拼接字符串
        let dataStr = '';
        Object.keys(data).forEach(key => {
            dataStr += key + '=' + data[key] + '&';
        })
        if (dataStr !== '') {
            dataStr = dataStr.substr(0, dataStr.lastIndexOf('&'));
            url = url + '?' + dataStr;
        }
    }
    if (type === 'POST') {
        Object.defineProperty(requestConfig, 'body', {
            value: JSON.stringify(data)
        })
    }
    let responsePromise = await fetch(url, requestConfig);
    return await responsePromise.json();
}
