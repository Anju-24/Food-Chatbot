const Order = require("./Order");
const burgerRate=8;
const sandwichRate=10;
const wrapRate=7;
const largeRate=4;
const friesRate=4;
const drinksRate=5;

const OrderState = Object.freeze({
  WELCOMING:   Symbol("welcoming"),
  SIZE:   Symbol("size"),
  FILLINGS:   Symbol("fillings"),
  DRINKS:  Symbol("drinks"),
  SELECT: Symbol("select"),
  RECEIPT:    Symbol("receipt"),
  ORDERMORE:  Symbol("ordermore"),
  FRIES:  Symbol("fries"),
  PAYMENT: Symbol("payment")
});

var flag=true;
var dict=[];
module.exports = class FoodOrder extends Order{
    constructor(sNumber, sUrl){
        super(sNumber, sUrl);
        this.stateCur = OrderState.WELCOMING;
        this.sSize = "";
        this.sFillings = "";
        this.sDrinks = "";
        this.sItem = "";
        this.sPrice=0;
        this.sFries="";
        this.orderText="";
    }    
    handleInput(sInput)
    {                
        let aReturn = [];                        
        switch(this.stateCur)
        {
            case OrderState.WELCOMING:
                if(flag)
                {
                    aReturn.push("Welcome to Anjuzz Food Hub.");
                    flag=false;
                }                                     
                aReturn.push("What would you like to have?");
                aReturn.push("Please enter your choice");
                aReturn.push("1. Sandwich"+"\n2. Burger"+"\n3. Wrap");
                this.stateCur = OrderState.SELECT;
                break;
            case OrderState.SELECT:
              if(sInput=="1"||sInput=="2"||sInput=="3")
              {
                this.stateCur = OrderState.SIZE;
                switch(sInput)
                {
                  case "1":
                    this.sItem="Sandwich";
                    this.sPrice+=sandwichRate;
                    break;  
                  case "2":
                    this.sItem="Burger"
                    this.sPrice+=burgerRate;
                    break;
                  case "3":
                    this.sItem="Wrap"
                    this.sPrice+=wrapRate;
                    break;
                }
                this.stateCur = OrderState.SIZE;
                aReturn.push(`What size ${this.sItem} would you like to have?\nRegular\nLarge`);
                break;                  
              }                           
                aReturn.push(`Please select a valid item from the menu.Enter the corresponding number`);
                break;                
            case OrderState.SIZE:                
                dict=["large","regular"];
                if(dict.includes(sInput.toLowerCase()))
                {
                  if(sInput.toLowerCase() == "large")
                  {
                    this.sPrice+=largeRate;
                  }
                this.stateCur = OrderState.FILLINGS
                this.sSize = sInput;  
                aReturn.push(`What fillings would you like for the ${this.sItem}?\nEggs\nChicken\nBacon\nVeggies`);
                break;
                }
                aReturn.push(`Please enter valid input\nLarge or Regular`);
                break;
            case OrderState.FILLINGS:
              dict=["eggs","chicken","bacon","veggies"];
              if(dict.includes(sInput.toLowerCase()))
              {
                this.stateCur = OrderState.DRINKS
                this.sFillings = sInput;
                this.orderText+=`${this.sSize} ${this.sItem} with ${this.sFillings}\n`;
                aReturn.push("Would you like drinks with that?");
                break;
              }
              aReturn.push(`Please enter valid input\nEggs\nChicken\nBacon\nVeggies`);
              break;
            case OrderState.DRINKS:
                dict=["yes","no"];
                if(dict.includes(sInput.toLowerCase()))
                {
                  if(sInput.toLowerCase() != "no")
                  {
                      this.sDrinks = sInput;
                      this.sPrice+=drinksRate;
                  }
                  aReturn.push("Would you like to order fries too?");
                  this.stateCur = OrderState.FRIES;
                  break;
                }
                aReturn.push(`Please enter valid input\nYes or No`);
                break;
            case OrderState.FRIES:
              dict=["yes","no"];
              if(dict.includes(sInput.toLowerCase()))
                {
                  if(sInput.toLowerCase() != "no")
                  {
                      this.sFries = sInput;
                      this.sPrice+=friesRate;
                  }
                  aReturn.push("Would you like to order more?");
                  this.stateCur = OrderState.ORDERMORE                
                  break;
                }
                aReturn.push(`Please enter valid input\nYes or No`);
                break;
            case OrderState.ORDERMORE:
              dict=["yes","no"];
              if(dict.includes(sInput.toLowerCase()))
                {             
                  if(sInput.toLowerCase() == "yes")
                  {                   
                      this.stateCur = OrderState.WELCOMING;                                 
                      aReturn.push("Please press yes to proceed");                   
                  } 
                  else
                  {
                    this.stateCur = OrderState.RECEIPT;
                  }                                       
                } 
                else{
                  aReturn.push(`Please enter valid input\nYes or No`);
                  break;
                }                                                                                
            case OrderState.RECEIPT:
                if(sInput.toLowerCase() == "no")
                {  
                    aReturn.push("Thank-you for your order of");
                    aReturn.push(this.orderText);                                
                    if(this.sDrinks){
                        aReturn.push("Drinks $5 each");
                    }
                    if(this.sFries){
                        aReturn.push("Fries $4 each");
                    }                
                    aReturn.push(`Your SubTotal =$ ${this.sPrice}`);
                    aReturn.push(`Tax =$ ${0.13*this.sPrice}`);
                    this.sPrice+=0.13*this.sPrice;
                    aReturn.push(`Total Amount =$ ${(this.sPrice).toFixed(3)}`);
                    aReturn.push(`Please pay for your order here`);
                    aReturn.push(`${this.sUrl}/payment/${this.sNumber}/`);
                    this.stateCur = OrderState.PAYMENT;
                }
				        break;
            case OrderState.PAYMENT:
					          console.log(sInput);			
                    var address = sInput.purchase_units[0].shipping.address;
                    var custName=sInput.payer.name;	
                    this.isDone(true);
                    let d = new Date(); 
                    d.setMinutes(d.getMinutes() + 20);
                    aReturn.push(`Your order will be delivered to ${custName.given_name} ${custName.surname} ,${address.address_line_1}, ${address.admin_area_2},
                    ${address.admin_area_1}, ${address.postal_code}, ${address.country_code} at ${d.toLocaleString()}`);
                    flag=true;
					break;           
        }
        return aReturn;
    }
    renderForm(sTitle = "-1", sPrice = "-1"){
      // your client id should be kept private
      if(sTitle != "-1"){
        this.sItem = sTitle;
      }
      if(sPrice != "-1"){
        this.sPrice = sPrice;
      }
      const sClientID = process.env.SB_CLIENT_ID || 'put your client id here for testing ... Make sure that you delete it before committing'
      return(`
      <!DOCTYPE html>
  
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Ensures optimal rendering on mobile devices. -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <!-- Optimal Internet Explorer compatibility -->
      </head>
      
      <body>
        <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
        <script
          src="https://www.paypal.com/sdk/js?client-id=${sClientID}"> // Required. Replace SB_CLIENT_ID with your sandbox client ID.
        </script>
        Thank you ${this.sNumber} for your order of $${this.sPrice}.
        <div id="paypal-button-container"></div>
  
        <script>
          paypal.Buttons({
              createOrder: function(data, actions) {
                // This function sets up the details of the transaction, including the amount and line item details.
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: '${this.sPrice}'
                    }
                  }]
                });
              },
              onApprove: function(data, actions) {
                // This function captures the funds from the transaction.
                return actions.order.capture().then(function(details) {
                  // This function shows a transaction success message to your buyer.
                  $.post(".", details, ()=>{
                    window.open("", "_self");
                    window.close(); 
                  });
                });
              }
          
            }).render('#paypal-button-container');
          // This function displays Smart Payment Buttons on your web page.
        </script>
      
      </body>
          
      `);
  
    }
}