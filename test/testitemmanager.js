const ItemManager = artifacts.require("./ItemManager.sol");

contract("ItemManager test", async accounts => {
  it("... should be able to add an item", async () => {
    const instance = await ItemManager.deployed();
    const name = "iphone";
    const price = 500;
    let result = await instance.createItem(name,price,{from: accounts[0]});
    //console.log(result);
    assert.equal(result.logs[0].args._itemIndex,0,"Its not the first Item");
    const nametest = await instance.items(0);
    assert.equal(nametest._identifier,name,"The Name dont match");
    
    });
  });