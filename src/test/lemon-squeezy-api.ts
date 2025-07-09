import fastifyFactory from 'fastify';
import {type Subscription} from '../../functions/src/subscription-schema';

export function createMockLemonServer({port = 3001}: {port?: number}) {
  const fastify = fastifyFactory();

  let subscriptions: Subscription[] = [];
  function setSubscriptions(newSubscriptions: Subscription[]) {
    subscriptions = newSubscriptions;
    console.log(
      'Mock Lemon Squeezy API: Setting subscriptions',
      newSubscriptions,
    );
  }

  fastify.get('/v1/subscriptions', async (_, reply) => {
    console.log('Mock Lemon Squeezy API: GET /v1/subscriptions');
    return reply.send({data: subscriptions});
  });

  fastify.get<{Params: {id: string}}>(
    '/v1/subscriptions/:id',
    async (request, reply) => {
      console.log('Mock Lemon Squeezy API: GET /v1/subscriptions/:id');
      const {id} = request.params;
      return reply.send({data: subscriptions.find((sub) => sub.id === id)});
    },
  );

  fastify.get('/customer-portal', async (_, reply) => {
    console.log('Mock Lemon Squeezy API: GET /user-portal');
    return reply
      .type('text/html')
      .send('<html><body>Mock User Portal</body></html>');
  });

  return {
    setSubscriptions,
    async start() {
      await fastify.listen({port});
      console.log(`Mock Lemon Squeezy API running on http://localhost:${port}`);
    },
    async stop() {
      await fastify.close();
    },
  };
}
