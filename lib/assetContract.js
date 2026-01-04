'use strict';

const { Contract } = require('fabric-contract-api');

/**
 * AssetContract - Production-grade smart contract for asset management
 * Supports CRUD operations with validation and error handling
 */
class AssetContract extends Contract {

    constructor() {
        super('AssetContract');
    }

    /**
     * Initialize the ledger with sample assets
     * @param {Context} ctx - Transaction context
     */
    async InitLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');

        const assets = [
            {
                ID: 'asset1',
                Color: 'blue',
                Owner: 'Kerem',
                CreatedAt: new Date().toISOString(),
                UpdatedAt: new Date().toISOString()
            },
            {
                ID: 'asset2',
                Color: 'red',
                Owner: 'Ahmet',
                CreatedAt: new Date().toISOString(),
                UpdatedAt: new Date().toISOString()
            },
            {
                ID: 'asset3',
                Color: 'green',
                Owner: 'Mehmet',
                CreatedAt: new Date().toISOString(),
                UpdatedAt: new Date().toISOString()
            }
        ];

        for (const asset of assets) {
            asset.DocType = 'asset';
            await ctx.stub.putState(asset.ID, Buffer.from(JSON.stringify(asset)));
            console.info(`Asset ${asset.ID} initialized`);
        }

        console.info('============= END : Initialize Ledger ===========');
        return JSON.stringify({ success: true, message: 'Ledger initialized with sample assets' });
    }

    /**
     * Create a new asset on the ledger
     * @param {Context} ctx - Transaction context
     * @param {String} id - Asset ID (required)
     * @param {String} color - Asset color (required)
     * @param {String} owner - Asset owner (required)
     */
    async CreateAsset(ctx, id, color, owner) {
        console.info('============= START : Create Asset ===========');

        // Input validation
        if (!id || typeof id !== 'string' || id.trim() === '') {
            throw new Error('Asset ID is required and must be a non-empty string');
        }
        if (!color || typeof color !== 'string' || color.trim() === '') {
            throw new Error('Asset color is required and must be a non-empty string');
        }
        if (!owner || typeof owner !== 'string' || owner.trim() === '') {
            throw new Error('Asset owner is required and must be a non-empty string');
        }

        // Sanitize inputs
        const sanitizedId = id.trim();
        const sanitizedColor = color.trim();
        const sanitizedOwner = owner.trim();

        // Check if asset already exists
        const exists = await this.AssetExists(ctx, sanitizedId);
        if (exists) {
            throw new Error(`Asset ${sanitizedId} already exists`);
        }

        const asset = {
            DocType: 'asset',
            ID: sanitizedId,
            Color: sanitizedColor,
            Owner: sanitizedOwner,
            CreatedAt: new Date().toISOString(),
            UpdatedAt: new Date().toISOString()
        };

        await ctx.stub.putState(sanitizedId, Buffer.from(JSON.stringify(asset)));
        console.info(`Asset ${sanitizedId} created successfully`);
        console.info('============= END : Create Asset ===========');

        return JSON.stringify(asset);
    }

    /**
     * Read an asset from the ledger
     * @param {Context} ctx - Transaction context
     * @param {String} id - Asset ID
     */
    async ReadAsset(ctx, id) {
        console.info('============= START : Read Asset ===========');

        if (!id || typeof id !== 'string' || id.trim() === '') {
            throw new Error('Asset ID is required');
        }

        const sanitizedId = id.trim();
        const assetJSON = await ctx.stub.getState(sanitizedId);

        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`Asset ${sanitizedId} does not exist`);
        }

        console.info('============= END : Read Asset ===========');
        return assetJSON.toString();
    }

    /**
     * Update an existing asset on the ledger
     * @param {Context} ctx - Transaction context
     * @param {String} id - Asset ID
     * @param {String} color - New color
     * @param {String} owner - New owner
     */
    async UpdateAsset(ctx, id, color, owner) {
        console.info('============= START : Update Asset ===========');

        // Input validation
        if (!id || typeof id !== 'string' || id.trim() === '') {
            throw new Error('Asset ID is required');
        }
        if (!color || typeof color !== 'string' || color.trim() === '') {
            throw new Error('Asset color is required');
        }
        if (!owner || typeof owner !== 'string' || owner.trim() === '') {
            throw new Error('Asset owner is required');
        }

        const sanitizedId = id.trim();
        const sanitizedColor = color.trim();
        const sanitizedOwner = owner.trim();

        // Get existing asset
        const assetJSON = await ctx.stub.getState(sanitizedId);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`Asset ${sanitizedId} does not exist`);
        }

        const existingAsset = JSON.parse(assetJSON.toString());

        const updatedAsset = {
            DocType: 'asset',
            ID: sanitizedId,
            Color: sanitizedColor,
            Owner: sanitizedOwner,
            CreatedAt: existingAsset.CreatedAt,
            UpdatedAt: new Date().toISOString()
        };

        await ctx.stub.putState(sanitizedId, Buffer.from(JSON.stringify(updatedAsset)));
        console.info(`Asset ${sanitizedId} updated successfully`);
        console.info('============= END : Update Asset ===========');

        return JSON.stringify(updatedAsset);
    }

    /**
     * Delete an asset from the ledger
     * @param {Context} ctx - Transaction context
     * @param {String} id - Asset ID
     */
    async DeleteAsset(ctx, id) {
        console.info('============= START : Delete Asset ===========');

        if (!id || typeof id !== 'string' || id.trim() === '') {
            throw new Error('Asset ID is required');
        }

        const sanitizedId = id.trim();
        const exists = await this.AssetExists(ctx, sanitizedId);
        if (!exists) {
            throw new Error(`Asset ${sanitizedId} does not exist`);
        }

        await ctx.stub.deleteState(sanitizedId);
        console.info(`Asset ${sanitizedId} deleted successfully`);
        console.info('============= END : Delete Asset ===========');

        return JSON.stringify({ success: true, message: `Asset ${sanitizedId} deleted` });
    }

    /**
     * Check if an asset exists on the ledger
     * @param {Context} ctx - Transaction context
     * @param {String} id - Asset ID
     */
    async AssetExists(ctx, id) {
        if (!id || typeof id !== 'string') {
            return false;
        }

        const assetJSON = await ctx.stub.getState(id.trim());
        return assetJSON && assetJSON.length > 0;
    }

    /**
     * Transfer asset ownership
     * @param {Context} ctx - Transaction context
     * @param {String} id - Asset ID
     * @param {String} newOwner - New owner name
     */
    async TransferAsset(ctx, id, newOwner) {
        console.info('============= START : Transfer Asset ===========');

        if (!id || typeof id !== 'string' || id.trim() === '') {
            throw new Error('Asset ID is required');
        }
        if (!newOwner || typeof newOwner !== 'string' || newOwner.trim() === '') {
            throw new Error('New owner is required');
        }

        const sanitizedId = id.trim();
        const sanitizedNewOwner = newOwner.trim();

        const assetJSON = await ctx.stub.getState(sanitizedId);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`Asset ${sanitizedId} does not exist`);
        }

        const asset = JSON.parse(assetJSON.toString());
        const oldOwner = asset.Owner;
        asset.Owner = sanitizedNewOwner;
        asset.UpdatedAt = new Date().toISOString();

        await ctx.stub.putState(sanitizedId, Buffer.from(JSON.stringify(asset)));
        console.info(`Asset ${sanitizedId} transferred from ${oldOwner} to ${sanitizedNewOwner}`);
        console.info('============= END : Transfer Asset ===========');

        return JSON.stringify(asset);
    }

    /**
     * Get all assets from the ledger
     * @param {Context} ctx - Transaction context
     */
    async GetAllAssets(ctx) {
        console.info('============= START : Get All Assets ===========');

        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');

        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
                // Only include assets (filter by DocType)
                if (record.DocType === 'asset') {
                    allResults.push(record);
                }
            } catch (err) {
                console.error(`Error parsing record: ${err}`);
                record = strValue;
            }
            result = await iterator.next();
        }

        await iterator.close();
        console.info(`Found ${allResults.length} assets`);
        console.info('============= END : Get All Assets ===========');

        return JSON.stringify(allResults);
    }

    /**
     * Get asset history
     * @param {Context} ctx - Transaction context
     * @param {String} id - Asset ID
     */
    async GetAssetHistory(ctx, id) {
        console.info('============= START : Get Asset History ===========');

        if (!id || typeof id !== 'string' || id.trim() === '') {
            throw new Error('Asset ID is required');
        }

        const sanitizedId = id.trim();
        const historyIterator = await ctx.stub.getHistoryForKey(sanitizedId);
        const allResults = [];

        let result = await historyIterator.next();
        while (!result.done) {
            const record = {
                txId: result.value.txId,
                timestamp: result.value.timestamp,
                isDelete: result.value.isDelete
            };

            if (!result.value.isDelete) {
                try {
                    record.value = JSON.parse(result.value.value.toString('utf8'));
                } catch (err) {
                    record.value = result.value.value.toString('utf8');
                }
            }

            allResults.push(record);
            result = await historyIterator.next();
        }

        await historyIterator.close();
        console.info(`Found ${allResults.length} history records for asset ${sanitizedId}`);
        console.info('============= END : Get Asset History ===========');

        return JSON.stringify(allResults);
    }

    /**
     * Query assets by owner using rich query (requires CouchDB)
     * @param {Context} ctx - Transaction context
     * @param {String} owner - Owner name
     */
    async QueryAssetsByOwner(ctx, owner) {
        console.info('============= START : Query Assets By Owner ===========');

        if (!owner || typeof owner !== 'string' || owner.trim() === '') {
            throw new Error('Owner is required');
        }

        const sanitizedOwner = owner.trim();
        const queryString = JSON.stringify({
            selector: {
                DocType: 'asset',
                Owner: sanitizedOwner
            }
        });

        const resultsIterator = await ctx.stub.getQueryResult(queryString);
        const allResults = [];

        let result = await resultsIterator.next();
        while (!result.done) {
            try {
                const record = JSON.parse(result.value.value.toString('utf8'));
                allResults.push(record);
            } catch (err) {
                console.error(`Error parsing record: ${err}`);
            }
            result = await resultsIterator.next();
        }

        await resultsIterator.close();
        console.info(`Found ${allResults.length} assets for owner ${sanitizedOwner}`);
        console.info('============= END : Query Assets By Owner ===========');

        return JSON.stringify(allResults);
    }
}

module.exports = AssetContract;
