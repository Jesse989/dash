// fetch data 
import Papa from 'papaparse'

export default class DataAPI {
    url: string;
    constructor(url: string) {
        this.url = url
    }

    getData(cb: any) {
        Papa.parse(this.url, {
            header: true,
            download: true,
            complete: cb
        });
    }
}