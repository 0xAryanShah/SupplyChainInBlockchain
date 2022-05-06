import React, { Component } from "react";
import ItemManagerContract from "./contracts/itemManager.json";
import ItemContract from "./contracts/Item.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { loaded: false, price:0, itemName:"example_1" };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();
      
      this.itemManager = new this.web3.eth.Contract(
        ItemManagerContract.abi,
        ItemManagerContract.networks[this.networkId] && ItemManagerContract.networks[this.networkId].address,
      );
      this.item = new this.web3.eth.Contract(
        ItemContract.abi,
        ItemContract.networks[this.networkId] && ItemManagerContract.networks[this.networkId].address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.listenToPaymentEvent();
      this.setState({ loaded: true });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  }; 
  
  listenToPaymentEvent = () => {
    let self = this;
    this.itemManager.events.supplyChainStep().on("data", async function(event){
      console.log(event);
      let itemObj = await self.itemManager.methods.items(event.returnValues._itemIndex).call();
      console.log(itemObj);
      alert("Item "+itemObj._identifier+" was paid ,deliver it now!");
    });
  }

  handleInputChange = (event)=>{
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  handleSubmit = async()=>{
    const {price,itemName} = this.state;
    let result = await this.itemManager.methods.createItem(itemName,price).send({from: this.accounts[0]});
    //console.log(result);
    alert("Send "+price+" Wei to "+result.events.supplyChainStep.returnValues._itemAddress);
  }

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Supply Chain Management</h1>        
        <h2>Items</h2>
        <h2>Add Items</h2>
        Cost in Wei: <input type="text" name="price" value={this.state.price} onChange={this.handleInputChange}/>
        Item Identifier: <input type="text" name="itemName" value={this.state.itemName} onChange={this.handleInputChange}/>
        <button type="button" onClick={this.handleSubmit}>Create New Item</button>

      </div>
    );
  }
}

export default App;
