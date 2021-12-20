import ResponseWrapper from './ResponseWrapper';
import { IForCollection, IForCollectionItem, IForSite, IForWebhook, IQueryParams, IWebflowAugmentedItem, IWebflowCollectionItemRemoveResponse, IWebflowCollectionItemResponse, IWithFields, IWithFieldsPartial } from './types';
export declare type IWebflowOptions = {
    endpoint?: string;
    token?: string;
    version?: string;
};
export declare type HTTP_METHOD = 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'POST' | 'PUT' | 'PATCH';
export declare type IFetchOptions = {
    method: HTTP_METHOD;
    headers: Record<string, string>;
    mode: string;
    body?: string;
};
export declare class Webflow {
    responseWrapper: ResponseWrapper;
    endpoint: string;
    token: string;
    headers: Record<string, string>;
    constructor({ endpoint, token, version, }?: IWebflowOptions);
    authenticatedFetch: (method: HTTP_METHOD, path: string, data?: any, query?: Record<string, any> | undefined) => any;
    get(path: string, query?: IQueryParams): any;
    post(path: string, data: any, query?: IQueryParams): any;
    put(path: string, data: any, query?: IQueryParams): any;
    patch(path: string, data: any, query?: IQueryParams): any;
    delete(path: string, query?: IQueryParams): any;
    info(query?: IQueryParams): any;
    sites(query?: IQueryParams): any;
    site<T extends IForSite>({ siteId }: T, query?: IQueryParams): any;
    publishSite({ siteId, domains }: {
        siteId: any;
        domains: any;
    }): any;
    domains<T extends IForSite>({ siteId }: T): any;
    collections<T extends IForSite>({ siteId }: T, query?: IQueryParams): any;
    collection<R = any, T extends IForCollection = IForCollection>({ collectionId }: T, query?: IQueryParams): any;
    items<R = any, T extends IForCollection = IForCollection>({ collectionId }: T, query?: IQueryParams): Promise<IWebflowCollectionItemResponse<IWebflowAugmentedItem<R>>>;
    item<R = any, T extends IForCollectionItem = IForCollectionItem>({ collectionId, itemId }: T, query?: IQueryParams): Promise<IWebflowAugmentedItem<R>>;
    createItem<R = any, T extends IForCollection & IWithFields<R> = IForCollection & IWithFields<R>>({ collectionId, ...data }: T, query?: IQueryParams): Promise<IWebflowAugmentedItem<R>>;
    updateItem<R = any, T extends IForCollectionItem & IWithFields<R> = IForCollectionItem & IWithFields<R>>({ collectionId, itemId, ...data }: T, query?: IQueryParams): Promise<R>;
    removeItem<T extends IForCollectionItem = IForCollectionItem>({ collectionId, itemId }: T, query?: IQueryParams): Promise<IWebflowCollectionItemRemoveResponse>;
    patchItem<R = any, T extends IForCollectionItem & IWithFieldsPartial<R> = IForCollectionItem & IWithFieldsPartial<R>>({ collectionId, itemId, ...data }: T, query?: IQueryParams): Promise<R>;
    webhooks<T extends IForSite>({ siteId }: T, query?: IQueryParams): any;
    webhook<T extends IForWebhook>({ siteId, webhookId }: T, query?: IQueryParams): any;
    createWebhook<T extends IForSite>({ siteId, ...data }: T, query?: IQueryParams): any;
    removeWebhook<T extends IForWebhook>({ siteId, webhookId }: T, query?: IQueryParams): any;
}
