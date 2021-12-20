export declare type IForSite = {
    siteId: string;
};
export declare type IForWebhook = IForSite & {
    webhookId: string;
};
export declare type IForCollection = {
    collectionId: string;
};
export declare type IForCollectionItem = IForCollection & {
    itemId: string;
};
export declare type IWithFields<T> = {
    fields: T;
};
export declare type IWithFieldsPartial<T> = {
    fields: Partial<T>;
};
export declare type IQueryParams = Record<string, any>;
/**
 *
 */
export interface IWebflowCollectionItemResponse<T = any> {
    items: T[];
    count: number;
    limit: number;
    offset: number;
    total: number;
    /**
     *
     *
     * NOTE: This is added by the webflow-api library (not part of the Webflow API itself)
     *
     * NOTE: The rateLimit value won't be available in cross-origin requests because it's not
     * possible to access the header values containing this information in CORs response objects.
     *
     * See: https://developers.google.com/web/updates/2015/03/introduction-to-fetch#response_types
     * See: https://fetch.spec.whatwg.org/#concept-filtered-response-basic
     */
    _meta: {
        rateLimit: number;
        remaining: number;
    };
}
/**
 * Properties added by webflow to each `item` in a `collection`.
 *
 * https://developers.webflow.com/#item-model
 */
export interface IWebflowCollectionItem_meta {
    "_id": string;
    "_cid": string;
    "name": string;
    "slug": string;
    "_archived": boolean;
    "_draft": boolean;
    "updated-on": string;
    "updated-by": string;
    "created-on": string;
    "created-by": string;
    "published-on": string;
    "published-by": string;
}
/**
 * Items returned through the API are augmented with the methods in IApiItem
 */
export declare type IWebflowAugmentedItem<R> = R & IApiItem<R>;
export interface IApiItem<T> {
    update: (first: T, query?: IQueryParams) => Promise<T>;
    patch: (first: T, query?: IQueryParams) => Promise<T>;
    remove: <U extends IForCollectionItem>(data: U) => Promise<IWebflowCollectionItemRemoveResponse>;
}
/**
 * Response when `remove`ing an `item` from a `collection`.
 */
export interface IWebflowCollectionItemRemoveResponse {
    deleted: number;
}
