const custom = require('@uifabric/build/storybook/webpack.config');

module.exports = {
  webpackFinal: config => {
    return custom({ config });
  },
  addons: ['@storybook/addon-knobs/register', '@storybook/addon-a11y/register', 'storybook-addon-performance/register'],
};
