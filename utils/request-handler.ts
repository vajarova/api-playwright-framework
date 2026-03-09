import { APIRequestContext } from "@playwright/test";
import {expect} from '@playwright/test'
import { APILogger } from "./logger";

export class RequestHandler{

    private request: APIRequestContext
    private logger: APILogger
    private baseUrl: string;
    private defaultUrl: string;
    private apiPath: string = '';
    private queryParams: object = {};
    private apiHeaders: Record<string, string> = {};
    private apiBody: object = {};

    constructor(request: APIRequestContext, apiBaseUrl: string, logger: APILogger){
        this.request = request
        this.defaultUrl = apiBaseUrl
        this.logger = logger
    }


    url(url: string){
        this.baseUrl = url;
        return this
    }

    path(path: string){
        this.apiPath = path
        return this
    }

    params(params: object){
        this.queryParams = params
        return this
    }

    headers(headers: Record<string, string>){
        this.apiHeaders = headers
        return this
    }

    body(body: object){
        this.apiBody = body
        return this
    }

    async getRequest(statusCode: number){
        const url = this.getUrl()
        //Use custom logger to capture request
        this.logger.logRequest("GET", url, this.apiHeaders, this.apiBody)
        const response = await this.request.get(url, {
            headers: this.apiHeaders
        })

        const actualStatus = response.status()
        const responseJson = await response.json()
        //Use custom logger to capture response
        this.logger.logResponse(actualStatus, responseJson)
        //Use custom status code assertion
        this.statusCodeValidator(actualStatus,statusCode,this.getRequest)
        return responseJson
    }

    async postRequest(statusCode: number){
        const url = this.getUrl()
        //Use custom logger to capture request
        this.logger.logRequest("POST", url, this.apiHeaders, this.apiBody)
        const response = await this.request.post(url, {
            data: this.apiBody,
            headers: this.apiHeaders
        })

        const actualStatus = response.status()
        const responseJson = response.json()
        
        //Use custom logger to capture response
        this.logger.logResponse(actualStatus,responseJson)

        this.statusCodeValidator(actualStatus, statusCode, this.postRequest)
        return responseJson
    }

    async putRequest(statusCode: number) {
        const url = this.getUrl()
        //Use custom logger to log request
        this.logger.logRequest("PUT", url, this.apiHeaders, this.apiBody)
        const response = await this.request.put(url, {
            data: this.apiBody,
            headers: this.apiHeaders
        })
        const responseJson = response.json()
        const actualStatus = response.status()

        //Use custom logger to log response
        this.logger.logResponse(actualStatus,responseJson)

        this.statusCodeValidator(actualStatus, statusCode, this.putRequest)
        
        return responseJson
    }

    async deleteRequest(statusCode: number){
        const url = this.getUrl()
        //Use custom logger to log request
        this.logger.logRequest("DELETE", url, this.apiHeaders)
        const response = await this.request.delete(url,{
            headers: this.apiHeaders
        })
        const actualStatus = response.status()
        //Use custom logger to log response
        this.logger.logResponse(actualStatus)

        this.statusCodeValidator(actualStatus, statusCode, this.deleteRequest)
        
    }

    private getUrl(){
        const url = new URL(`${this.baseUrl ?? this.defaultUrl}${this.apiPath}`)
        for(const [key, value] of Object.entries(this.queryParams)){
            url.searchParams.append(key,value)
        }
        return url.toString()
    }

    private statusCodeValidator(actualStatus: number, expectedStatus: number, callingMethod:Function){
        if(actualStatus !== expectedStatus){
            const logs = this.logger.getRecentLogs()
            const error = new Error(`Expected status ${expectedStatus} but got ${actualStatus} \n\n Recent API Activity: \n ${logs}`)
            Error.captureStackTrace(error, callingMethod)
            throw error
        }
    }
}