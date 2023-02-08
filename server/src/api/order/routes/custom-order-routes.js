module.exports = {
  routes: [
    {
      method: "GET",
      path: "/orders/customOrder",
      handler: "order.customOrderController",
      // config: {
      //   policies: [
      //     // point to a registered policy
      //     'policy-name',

      //     // point to a registered policy with some custom configuration
      //     { name: 'policy-name', config: {} },

      //     // pass a policy implementation directly
      //     (policyContext, config, { strapi }) => {
      //       return true;
      //     },
      //   ]
      // },
    },

    // pass it as an arraof routes api
    // {
    //   method: "GET",
    //   path: "/orders/customOrder",
    //   handler: "order.customOrderController",
    // }
  ],
};
