// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "./ItemManager.sol";
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