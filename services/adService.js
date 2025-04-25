const AdConfig = require('../models/adConfig');

// Default configuration if none exists.
const defaultAdConfig = {
    siteWide: {
        adUnits: [
            { unitId: 'ca-pub-2955413835387891', size: '300x250', position: 'sidebar' },
            { unitId: 'ca-pub-2955413835387891', size: '728x90', position: 'header' }
        ]
    }
};

async function getAdConfig() {
    let configDoc = await AdConfig.findOne({});
    if (!configDoc) {
        configDoc = await AdConfig.create({ config: defaultAdConfig });
    }
    return configDoc.config;
}

async function updateAdConfig(newConfig) {
    let configDoc = await AdConfig.findOne({});
    if (!configDoc) {
        configDoc = await AdConfig.create({ config: newConfig });
    } else {
        configDoc.config = { ...configDoc.config, ...newConfig };
        await configDoc.save();
    }
    return configDoc.config;
}

module.exports = { getAdConfig, updateAdConfig };
