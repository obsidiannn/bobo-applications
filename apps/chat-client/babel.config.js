module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          'crypto': 'react-native-quick-crypto',
          'stream': 'readable-stream',
          'buffer': '@craftzdog/react-native-buffer',
          'app': './app',
          'drizzle': './drizzle',
          'assets': './assets'
        },
      },
    ],
    [
      'inline-import',
      {
        extensions: ['.sql'],
      },
    ],
    'react-native-reanimated/plugin',
    ['module:react-native-dotenv',
      {
        envName: 'APP_ENV',
        moduleName: '@env',
        path: '.env',
      },
    ]
  ]
};
