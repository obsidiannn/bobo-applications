const { getDefaultConfig } = require('expo/metro-config');
const { mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
    resetCache: true,
    resolver: {
        resolveRequest: (context, moduleName, platform) => {
            if (moduleName === 'crypto') {
                // when importing crypto, resolve to react-native-quick-crypto
                return context.resolveRequest(
                    context,
                    'react-native-quick-crypto',
                    platform,
                )
            }
            return context.resolveRequest(context, moduleName, platform)
        },
        unstable_enableSymlinks: true,
        sourceExts: [
            ...getDefaultConfig(__dirname).resolver.sourceExts,
            'cjs',
            'sql',
        ]
    },
    transformer: {
        getTransformOptions: async () => ({
            transform: {
                inlineRequires: true,
            },
        }),
    }
};
module.exports = mergeConfig(getDefaultConfig(__dirname), config);
