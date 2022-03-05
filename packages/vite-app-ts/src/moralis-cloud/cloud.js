Moralis.Cloud.define('MultiSigVaults', async (request) => {
  const { owner } = request.params;
  const queryCreated = new Parse.Query('VaultCreated');
  queryCreated.descending('createdAt');
  const res = await queryCreated.find();

  const safePromises = res.map(async (safe) => {
    const querySafeOwners = new Parse.Query('OwnersChanged');
    querySafeOwners.equalTo('safe', safe.attributes.contractAddress);
    querySafeOwners.descending('createdAt');
    querySafeOwners.limit(1);
    const latestOwnerChange = await querySafeOwners.find();
    return {
      ...safe.attributes,
      owners: latestOwnerChange[0].attributes.owners,
      confirmationsRequired: latestOwnerChange[0].attributes.confirmationsRequired,
    };
  });

  const safes = await Promise.all(safePromises);
  return safes.filter((s) => s.owners.includes(owner));
});
