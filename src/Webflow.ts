import fetch from 'isomorphic-fetch';
import qs from 'qs';

import { isObjectEmpty } from './utils';
import ResponseWrapper from './ResponseWrapper';
import WebflowError, { buildRequiredArgError } from './WebflowError';
import {IApiItem, IForCollection, IForCollectionItem, IForSite, IForWebhook, IQueryParams,
  IWebflowAugmentedItem,
  IWebflowCollectionItemRemoveResponse, IWebflowCollectionItemResponse, IWithFields, IWithFieldsPartial } from './types';

const DEFAULT_ENDPOINT = 'https://api.webflow.com';

const buildMeta = (res) => {
  if (!res || !res.headers) { return {}; }

  return {
    rateLimit: {
      limit: parseInt(res.headers.get('x-ratelimit-limit'), 10),
      remaining: parseInt(res.headers.get('x-ratelimit-remaining'), 10),
    },
  };
};

const responseHandler = res =>
  res.json()
    .catch(err =>
      // Catch unexpected server errors where json isn't sent and rewrite
      // with proper class (WebflowError)
      Promise.reject(new WebflowError(err)))
    .then((body) => {
      if (res.status >= 400) {
        const errOpts: Record<string, any> = {
          code: body.code,
          msg: body.msg,
          _meta: buildMeta(res),
        };

        if (body.problems && body.problems.length > 0) {
          errOpts.problems = body.problems;
        }

        const errMsg = (body && body.err) ? body.err : 'Unknown error occured';
        const err = new WebflowError(errMsg);

        return Promise.reject(Object.assign(err, errOpts));
      }

      body._meta = buildMeta(res); // eslint-disable-line no-param-reassign

      return body;
    });

export type IWebflowOptions = {
  endpoint?: string,
  token?: string,
  version?: string,
};
export type HTTP_METHOD = 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'POST' | 'PUT' | 'PATCH';
export type IFetchOptions = {
  method: HTTP_METHOD,
  headers: Record<string, string>,
  mode: string,
  body?: string
};


export class Webflow {
  
  responseWrapper: ResponseWrapper;
  endpoint: string;
  token: string;
  headers: Record<string, string>
  
  constructor({
    endpoint = DEFAULT_ENDPOINT,
    token = '',
    version = '1.0.0',
  }: IWebflowOptions = {}) {
    if (!token) throw buildRequiredArgError('token');

    this.responseWrapper = new ResponseWrapper(this);

    this.endpoint = endpoint;
    this.token = token;

    this.headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'accept-version': version,
      'Content-Type': 'application/json',
    };
  }
  
  authenticatedFetch = (method: HTTP_METHOD, path: string, data?: any, query?: Record<string, any>) => {
    const queryString = query && !isObjectEmpty(query)
        ? `?${qs.stringify(query)}`
        : '';
    
    const uri = `${this.endpoint}${path}${queryString}`;
    const opts: IFetchOptions = {
      method,
      headers: this.headers,
      mode: 'cors',
    };
    
    if (data) {
      opts.body = JSON.stringify(data);
    }
    
    return fetch(uri, opts)
        .then(responseHandler);
  };

  // Generic HTTP request handlers

  get(path: string, query: IQueryParams = {}) {
    return this.authenticatedFetch('GET', path, false, query);
  }

  post(path: string, data, query: IQueryParams = {}) {
    return this.authenticatedFetch('POST', path, data, query);
  }

  put(path: string, data, query: IQueryParams = {}) {
    return this.authenticatedFetch('PUT', path, data, query);
  }

  patch(path: string, data, query: IQueryParams = {}) {
    return this.authenticatedFetch('PATCH', path, data, query);
  }

  delete(path: string, query: IQueryParams = {}) {
    return this.authenticatedFetch('DELETE', path, query);
  }

  // Meta

  info(query: IQueryParams = {}) {
    return this.get('/info', query);
  }

  // Sites

  sites(query: IQueryParams = {}) {
    return this.get('/sites', query).then(sites => sites.map(site => this.responseWrapper.site(site)));
  }

  site<T extends IForSite>({ siteId }: T, query: IQueryParams = {}) {
    if (!siteId) return Promise.reject(buildRequiredArgError('siteId'));

    return this.get(`/sites/${siteId}`, query).then(site => this.responseWrapper.site(site));
  }

  publishSite({ siteId, domains }) {
    if (!siteId) return Promise.reject(buildRequiredArgError('siteId'));
    if (!domains) return Promise.reject(buildRequiredArgError('domains'));

    return this.post(`/sites/${siteId}/publish`, { domains });
  }

  // Domains

  domains<T extends IForSite>({ siteId }: T) {
    if (!siteId) return Promise.reject(buildRequiredArgError('siteId'));

    return this.get(`/sites/${siteId}/domains`).then(
      domains => domains.map(domain => this.responseWrapper.domain(domain)),
    );
  }

  // Collections

  collections<T extends IForSite>({ siteId }: T, query: IQueryParams = {}) {
    if (!siteId) return Promise.reject(buildRequiredArgError('siteId'));

    return this.get(`/sites/${siteId}/collections`, query).then(
      collections => collections.map(collection => this.responseWrapper.collection(collection)),
    );
  }

  collection<R = any, T extends IForCollection = IForCollection>({ collectionId }: T, query: IQueryParams = {}) {
    if (!collectionId) return Promise.reject(buildRequiredArgError('collectionId'));

    return this.get(`/collections/${collectionId}`, query).then(
      collection => this.responseWrapper.collection(collection),
    );
  }

  // Items

  items<R = any, T extends IForCollection = IForCollection>({ collectionId }: T, query: IQueryParams = {}): Promise< IWebflowCollectionItemResponse< IWebflowAugmentedItem<R> > > {
    if (!collectionId) return Promise.reject(buildRequiredArgError('collectionId'));

    return this.get(`/collections/${collectionId}/items`, query).then(
      res => ({
        ...res,

        items: res.items.map(item => this.responseWrapper.item(item, collectionId)),
      }),
    );
  }

  item<R = any, T extends IForCollectionItem = IForCollectionItem>({ collectionId, itemId }: T, query: IQueryParams = {}): Promise< IWebflowAugmentedItem<R> > {
    if (!collectionId) return Promise.reject(buildRequiredArgError('collectionId'));
    if (!itemId) return Promise.reject(buildRequiredArgError('itemId'));

    return this.get(`/collections/${collectionId}/items/${itemId}`, query).then(
      res => this.responseWrapper.item(res.items[0], collectionId),
    );
  }

  createItem<
    R = any,
    T extends IForCollection & IWithFields<R> = IForCollection & IWithFields<R>
  >({ collectionId, ...data }: T, query: IQueryParams = {}): Promise< IWebflowAugmentedItem<R> > {
    if (!collectionId) return Promise.reject(buildRequiredArgError('collectionId'));

    return this.post(`/collections/${collectionId}/items`, data, query).then(
      item => this.responseWrapper.item(item, collectionId),
    );
  }

  updateItem<
    R = any,
    T extends IForCollectionItem & IWithFields<R> = IForCollectionItem & IWithFields<R>
  >({ collectionId, itemId, ...data }: T, query: IQueryParams = {}): Promise< R > {
    if (!collectionId) return Promise.reject(buildRequiredArgError('collectionId'));
    if (!itemId) return Promise.reject(buildRequiredArgError('itemId'));

    return this.put(`/collections/${collectionId}/items/${itemId}`, data, query);
  }

  removeItem<
    T extends IForCollectionItem = IForCollectionItem
  >({ collectionId, itemId }: T, query: IQueryParams = {}): Promise< IWebflowCollectionItemRemoveResponse > {
    
    if (!collectionId) return Promise.reject(buildRequiredArgError('collectionId'));
    if (!itemId) return Promise.reject(buildRequiredArgError('itemId'));

    return this.delete(`/collections/${collectionId}/items/${itemId}`, query);
  }

  patchItem<
    R = any,
    T extends IForCollectionItem & IWithFieldsPartial<R> = IForCollectionItem & IWithFieldsPartial<R>
  >({ collectionId, itemId, ...data }: T, query: IQueryParams = {}): Promise< R > {
    
    if (!collectionId) return Promise.reject(buildRequiredArgError('collectionId'));
    if (!itemId) return Promise.reject(buildRequiredArgError('itemId'));

    return this.patch(`/collections/${collectionId}/items/${itemId}`, data, query);
  }

  // Images

  // TODO

  // Webhooks

  webhooks<T extends IForSite>({ siteId }: T, query: IQueryParams = {}) {
    if (!siteId) return Promise.reject(buildRequiredArgError('siteId'));

    return this.get(`/sites/${siteId}/webhooks`, query).then(
      webhooks => webhooks.map(webhook => this.responseWrapper.webhook(webhook, siteId)),
    );
  }

  webhook<T extends IForWebhook>({ siteId, webhookId }: T, query: IQueryParams = {}) {
    if (!siteId) return Promise.reject(buildRequiredArgError('siteId'));
    if (!webhookId) return Promise.reject(buildRequiredArgError('webhookId'));

    return this.get(`/sites/${siteId}/webhooks/${webhookId}`, query).then(
      webhook => this.responseWrapper.webhook(webhook, siteId),
    );
  }

  createWebhook<T extends IForSite>({ siteId, ...data }: T, query: IQueryParams = {}) {
    if (!siteId) return Promise.reject(buildRequiredArgError('siteId'));

    return this.post(`/sites/${siteId}/webhooks`, data, query).then(
      webhook => this.responseWrapper.webhook(webhook, siteId),
    );
  }

  removeWebhook<T extends IForWebhook>({ siteId, webhookId }: T, query: IQueryParams = {}) {
    if (!siteId) return Promise.reject(buildRequiredArgError('siteId'));
    if (!webhookId) return Promise.reject(buildRequiredArgError('webhookId'));

    return this.delete(`/sites/${siteId}/webhooks/${webhookId}`, query);
  }
}
