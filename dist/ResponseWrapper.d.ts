import type { Webflow } from './Webflow';
export default class ResponseWrapper {
    api: Webflow;
    constructor(api: Webflow);
    site(site: any): any;
    domain(domain: any): any;
    collection(collection: any): any;
    item(item: any, collectionId: string): any;
    webhook(webhook: any, siteId: string): any;
}
