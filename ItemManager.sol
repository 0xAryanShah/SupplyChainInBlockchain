// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
contract Item{
    uint public priceInWei;
    uint public pricePaid;
    uint public index;
    itemManager parentContract;
    constructor(itemManager _parentContract,uint _priceInWei,uint _index)  {
        priceInWei=_priceInWei;
        index=_index;
        parentContract = _parentContract;
    }
    receive() external payable{
        require(pricePaid==0,"Item is paid already");
        require(priceInWei == msg.value,"Only Full Payments are allowed");
        pricePaid+=msg.value;
        
       (bool success,) = address(parentContract).call{value:msg.value}(abi.encodeWithSignature("triggerPayment(uint256)",index));
       require(success,"The Trasaction Was not Successfull");
    }    
}
contract itemManager{

    enum supplyChainStatus{
        Created,
        Paid,
        Delivered
    }

    struct s_item{
        Item _item;
        string _identifier;
        uint _price;
        itemManager.supplyChainStatus _status;
    }

    mapping (uint=>s_item) public items;
    uint itemIndex;

    event supplyChainStep(uint _itemIndex,uint _step,address _itemAddress);

    function createItem(string memory _identifier,uint _price) public{
        Item item = new Item(this,_price,itemIndex);
        items[itemIndex]._item = item;
        items[itemIndex]._identifier = _identifier;
        items[itemIndex]._price = _price;
        items[itemIndex]._status = supplyChainStatus.Created;
        emit supplyChainStep(itemIndex,uint(items[itemIndex]._status),address(item));
        itemIndex++;
    }

    function triggerPayment(uint _itemIndex) public payable{
        require(items[_itemIndex]._price == msg.value,"Only Full Price Are Accepted");
        require(items[_itemIndex]._status == supplyChainStatus.Created,"Item Status is Further");
        items[_itemIndex]._status = supplyChainStatus.Paid;
        emit supplyChainStep(_itemIndex,uint(items[_itemIndex]._status),address(items[_itemIndex]._item));
    }
    function triggerDelivery(uint _itemIndex) public{
        require(items[_itemIndex]._status == supplyChainStatus.Paid,"Item Status is not Paid");
        items[_itemIndex]._status = supplyChainStatus.Delivered;
        emit supplyChainStep(_itemIndex,uint(items[_itemIndex]._status),address(items[_itemIndex]._item));
    }

}