export {
  FastifyBaseLogger,
  FastifyPluginAsync,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerBase,
  RawServerDefault,
} from 'fastify';

declare module 'fastify' {
  export interface FastifyInstance {
    authenticate: any;
  }
}
