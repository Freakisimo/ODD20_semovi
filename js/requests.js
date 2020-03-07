'use strict';
const template_element = {
    // url: 'http://google.com/?', // Not necesary (because we can't guess where are you trying to go ¯\_(ツ)_/¯)
    method: 'GET',
    mode: 'cors',
    response: 'json',
    urldata: {},
    formdata: {},
    headers: {}
}

/** 
 * this works for one or many request using promise all to resolve 
 * all promises and return array of responses from all promises resolved
*/
class Requests {

    constructor(args) {
        this.requests_elements = args.requests_elements ? this.buildRequestsElements(args.requests_elements) : [];
        this.then_callback = args.then_callback ? args.then_callback : console.log;
        this.catch_callback = args.catch_callback ? args.catch_callback : console.log;
    }

    buildRequest() {
        // Calls for each element the function to create all data from request
        this.request_params = this.requests_elements.map(i => {
            let params = {
                url: `${i.url}?${this.buildURLData(i.urldata)}`,
                sent_data: {
                    method: i.method,
                    headers: new Headers(i.headers),
                    mode: i.mode
                }
            }
            if (i.method = ! 'GET') { params.sent_data.body = this.buildFormData(i.formdata) }
            return params
        });
    }

    appendRequest(new_req) {
        if (new_req.url) {
            this.requests_elements.push({
                url: new_req.url,
                method: new_req.method ? new_req.method : template_element.method,
                mode: new_req.mode ? new_req.mode : template_element.mode,
                response: new_req.response ? new_req.response : template_element.response,
                urldata: new_req.urldata ? new_req.urldata : template_element.urldata,
                formdata: new_req.formdata ? new_req.formdata : template_element.formdata,
                headers: new_req.headers ? new_req.headers : template_element.headers
            })
        }
    }

    send() {
        this.buildRequest();
        let _this = this;
        // build array of promises
        let all_requests = this.request_params.map(i => {
            return fetch(i.url, i.sent_data).then(response => response.json())
        });

        // Resolve all promises
        Promise.all(all_requests)
            .then(values => (_this.then_callback)(values))
            .catch(err => (_this.catch_callback)(err));
    }

    buildRequestsElements(elements) {
        // Basic structure of elements
        return elements.map(e => {
            if (e.url) {
                return {
                    url: e.url,
                    method: e.method ? e.method : template_element.method,
                    mode: e.mode ? e.mode : template_element.mode,
                    response: e.response ? e.response : template_element.response,
                    urldata: e.urldata ? e.urldata : template_element.urldata,
                    formdata: e.formdata ? e.formdata : template_element.formdata,
                    headers: e.headers ? e.headers : template_element.headers
                }
            }
        })
    }

    clearRequest() {
        this.requests_elements = [];
    }

    buildURLData(data) {
        // for a dict with the values {a: 1, b:2, c:3}
        // build string "a=1&b=2&c=3" 
        return Object.keys(data).map(k => `${k}=${data[k]}`).join("&");
    }

    buildFormData(data) {
        // create form data to send in the request from formdata values
        // Used mainly to send files
        let form = new FormData();
        Object.keys(data).forEach(k => form.append(k, data[k]))
        return form;
    }


}
