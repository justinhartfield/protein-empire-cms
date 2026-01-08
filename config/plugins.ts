export default () => ({
  graphql: {
    enabled: true,
    config: {
      endpoint: '/graphql',
      shadowCRUD: true,
      playgroundAlways: true,
      defaultLimit: 100,
      maxLimit: 1000,
      apolloServer: {
        tracing: false,
        introspection: true,
      },
    },
  },
});
