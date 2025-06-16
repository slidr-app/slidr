import fastifyFactory from 'fastify';

export type Subscription = {
  id: string;
  type: string;
  attributes: {
    user_email: string;
    status: string;
  };
};

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
