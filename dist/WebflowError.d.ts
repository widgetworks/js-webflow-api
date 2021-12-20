import ExtendableError from 'es6-error';
export default class WebflowError extends ExtendableError {
}
export declare const buildRequiredArgError: (name: any) => WebflowError;
