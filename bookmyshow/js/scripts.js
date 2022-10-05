// JQuery functions

// Changes the number on the plus and minus buttons when shopping for gift cards
$(".btn-number").click(function (e) {
  e.preventDefault();

  // Grabs HTML values
  fieldName = $(this).attr("data-field");
  type = $(this).attr("data-type");
  var input = $("input[name='" + fieldName + "']");
  var currentVal = parseInt(input.val());

  // Changes the value of the gift card quantity on the "Buy This Card" modal
  // If the value is too low or high, disable the - or + button
  if (!isNaN(currentVal)) {
    if (type == "minus") {
      if (currentVal > input.attr("min")) {
        input.val(currentVal - 1).change();
      }
      if (parseInt(input.val()) == input.attr("min")) {
        $(this).attr("disabled", true);
      }
    } else if (type == "plus") {
      if (currentVal < input.attr("max")) {
        input.val(currentVal + 1).change();
      }
      if (parseInt(input.val()) == input.attr("max")) {
        $(this).attr("disabled", true);
      }
    }
  } else {
    input.val(0);
  }
});

$(".input-number").focusin(function () {
  $(this).data("oldValue", $(this).val());
});

$(".input-number").change(function () {
  minValue = parseInt($(this).attr("min"));
  maxValue = parseInt($(this).attr("max"));
  valueCurrent = parseInt($(this).val());

  var name = $(this).attr("name");

  if (valueCurrent >= minValue) {
    $(".btn-number[data-type='minus'][data-field='" + name + "']").removeAttr(
      "disabled"
    );
  } else {
    $(this).val($(this).data("oldValue"));
  }
  if (valueCurrent <= maxValue) {
    $(".btn-number[data-type='plus'][data-field='" + name + "']").removeAttr(
      "disabled"
    );
  } else {
    $(this).val($(this).data("oldValue"));
  }
});

// If we have a total above ₹0, enable our checkout button
// Otherwise, disable it
$("#cart-btn").click(function () {
  const totalHtml = document.getElementById("cart-total");

  if (totalHtml !== null) {
    const totalPrice = parseInt(totalHtml.innerHTML.replace("Total: ₹", ""));
    const checkoutButtonHtml = document.getElementById("checkout-button");

    if (checkoutButtonHtml !== null) {
      if (totalPrice > 0) {
        $("#checkout-button").removeClass("disabled");
      } else {
        $("#checkout-button").addClass("disabled");
      }
    }
  } else {
    $("#checkout-button").addClass("disabled");
  }
});

// Put the gift card info on the modal before it opens up
$("#purchaseModal").on("show.bs.modal", function (event) {
  const button = $(event.relatedTarget);
  const modal = $(this)[0];

  if (button !== null && modal !== null) {
    const cardPrice = parseInt(button.attr("id").replace("-modal-button", ""));

    if (cardPrice !== null) {
      $("#modal-product-image").attr(
        "src",
        `../assets/cards/${cardPrice} INR Card.png`
      );
      $("#modal-add-to-cart").attr(
        "onclick",
        `addToShoppingCart('${cardPrice}-inr-card')`
      );
      $("#modal-product-title").html(
        `₹${cardPrice} BookMyShow&trade; Gift Card`
      );
    }
  }
});

$(document).on("click", "a[id$='modal-button']", function (event) {
  const inputNumber = $(".input-number");

  if (inputNumber !== null) {
    const quantity = parseInt(inputNumber.val());
    const minusButton = $("button[data-type='minus']");

    if (minusButton !== null && quantity === 1) {
      minusButton.attr("disabled", true);
    }
  }
});

// Triggers the moment the "delete gift card" button is clicked
$(document).on("click", "button[id^='discard-']", function (event) {
  const giftCardId = event.target.id.replace("discard-", "");
  confirmDelete(giftCardId);
});

// Triggers the moment the "checkout" button is clicked
$("#checkout-button").click(function (event) {
  let cartItems = [];
  let total = 0;
  const inr300Cards = document.getElementById("300-inr-card");
  const inr500Cards = document.getElementById("500-inr-card");
  const inr700Cards = document.getElementById("700-inr-card");

  if (inr300Cards !== null) {
    const quantity = parseInt(
      document
        .getElementById("300-inr-card-quantity")
        .innerHTML.replace("Quantity: ", "")
    );

    cartItems.push({
      price: 300,
      quantity: quantity,
    });
  }

  if (inr500Cards !== null) {
    const quantity = parseInt(
      document
        .getElementById("500-inr-card-quantity")
        .innerHTML.replace("Quantity: ", "")
    );

    cartItems.push({
      price: 500,
      quantity: quantity,
    });
  }

  if (inr700Cards !== null) {
    const quantity = parseInt(
      document
        .getElementById("700-inr-card-quantity")
        .innerHTML.replace("Quantity: ", "")
    );

    cartItems.push({
      price: 700,
      quantity: quantity,
    });
  }

  for (const item of cartItems) {
    total += item.quantity * item.price;
  }

  sessionStorage.setItem("cartItems", JSON.stringify(cartItems));
  sessionStorage.setItem("total", total);
  window.location.assign("../pages/payment.html");
});

// Keeps the login from refreshing randomly
$("#login-form").submit(function (event) {
  event.preventDefault();
});

// Makes the popup that confirms the user's sale and confirms it
$("#confirm-sale").submit(async function (event) {
  event.preventDefault();

  const balanceHtml = document.getElementById("sale-balance");
  const dateOfExpiryHtml = document.getElementById("sale-expiry");

  if (balanceHtml !== null && dateOfExpiryHtml !== null) {
    const balance = $("#sale-balance").val();
    const dateOfExpiry = $("#sale-expiry").val();
    const response = window.confirm(
      'Click "OK" to confirm the sale of your gift card.'
    );

    // Sell the card and record the sale in the DB
    if (response) {
      const uid = sessionStorage.getItem("uid");

      // Get current date
      const date = new Date();
      const utc = date.getTime() + date.getTimezoneOffset() * 60000;
      const today = new Date(utc + 3600000 * 5.5).toISOString().split("T")[0];

      // Store sale metadata in database
      try {
        const firebaseSaleRef = firebase.database().ref("sales/" + uid);

        await firebaseSaleRef.push({
          card_detail: "BookMyShow Gift Card",
          card_expiry_date: dateOfExpiry,
          balance: balance,
          date_of_purchase: today,
        });

        // Go back to dashboard
        alert("Thank you for selling at BookMyShow Gift Card Service!");
        window.location.assign("../pages/dashboard.html");
      } catch (e) {
        console.log("Error while attempting to sell card:", e);
        alert(e);
      }
    } else {
      // Clicked cancel, nothing happens
    }
  }
});

// Makes the popup that confirms the user's order and confirms it
$("#confirm-purchase").submit(async function (event) {
  event.preventDefault();

  const cartItems = JSON.parse(sessionStorage.getItem("cartItems"));
  const total = sessionStorage.getItem("total");
  let confirmMsg = "Your confirmed purchase is:\n";

  for (const item of cartItems) {
    confirmMsg += `${item.quantity} ₹${item.price} Gift Card`;
    confirmMsg += item.quantity != 1 ? "s" : "";
    confirmMsg += "\n";
  }

  confirmMsg += `\nFor a total of ₹${total}. Do you confirm this purchase?`;
  const response = window.confirm(confirmMsg);

  // If they click "Confirm"
  if (response) {
    const uid = sessionStorage.getItem("uid");
    const database = firebase.database();

    // Get current date
    const date = new Date();
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    const today = new Date(utc + 3600000 * 5.5);

    // Generate random date of expiry
    const dateOfExpiry = randomDateWithinTwoYearsAfter(today);

    // Store to database
    try {
      for (const item of cartItems) {
        await database.ref("purchases/" + uid).push({
          card_detail: "BookMyShow Gift Card",
          card_expiry_date: dateOfExpiry,
          amount: `${item.price} (${item.quantity})`,
          date_of_purchase: today.toISOString().split("T")[0],
        });
      }

      // Wipe cart and go back to dashboard
      alert("Thank you for shopping at BookMyShow Gift Card Service!");

      sessionStorage.setItem("cartItems", null);
      sessionStorage.setItem("total", null);
      window.location.assign("../pages/dashboard.html");
    } catch (e) {
      console.log("Error!\n", e);
      alert(e);
    }
  } else {
    // Clicked cancel, popup should close
  }
});

// Sets up the dashboard to load user-specific stuff (email, purchases, etc)
$(document).ready(function () {
  const orderHistoryList = document.getElementById("order-history");

  if (orderHistoryList !== null) {
    // Handle purchase stuff
    const uid = sessionStorage.getItem("uid");
    const dbPurchaseRef = firebase.database().ref("purchases/" + uid);

    dbPurchaseRef.get().then(function (snapshots) {
      if (snapshots.val() === null) {
        const loadingOrdersHtml = document.getElementById("loading-orders");

        if (loadingOrdersHtml !== null) {
          const loadingOrderItemHtml =
            document.getElementById("loading-order-item");
          loadingOrderItemHtml.innerHTML = "No card orders were found.";

          const loadingPurchaseItems = [
            document.getElementById("cards-bought"),
            document.getElementById("amount-spent"),
          ];

          for (const loadingItem of loadingPurchaseItems) {
            if (loadingItem !== null) {
              loadingItem.innerHTML = "0";
            }
          }
        }
      } else {
        const keys = Object.keys(snapshots.val());
        let cardsBought = 0;
        let total = 0;

        removeAllChildNodes(orderHistoryList);

        for (let i = 0; i < keys.length; i++) {
          const order = snapshots.val()[keys[i]];

          if (
            order.card_detail !== undefined &&
            order.card_expiry_date !== undefined &&
            order.amount !== undefined &&
            order.date_of_purchase !== undefined
          ) {
            const orderHtml = createOrderHtml(
              `<th scope="row">${i + 1}</th><td>${order.card_detail}</td><td>${
                order.card_expiry_date
              }</td><td>${order.amount}</td><td>${order.date_of_purchase}</td>`
            );

            orderHistoryList.appendChild(orderHtml);

            const leftPIdx = order.amount.indexOf("(");
            const rightPIdx = order.amount.indexOf(")");

            const price = parseInt(order.amount.substring(0, leftPIdx - 1));
            const quantity = parseInt(
              order.amount.substring(leftPIdx + 1, rightPIdx)
            );

            total += price * quantity;
            cardsBought += quantity;
          }
        }

        const cardsBoughtHtml = document.getElementById("cards-bought");
        const amountSpentHtml = document.getElementById("amount-spent");

        if (cardsBoughtHtml !== null && amountSpentHtml !== null) {
          cardsBoughtHtml.innerHTML = cardsBought;
          amountSpentHtml.innerHTML = "₹" + total;
        }
      }

      // Handle sale stuff
      const dbSaleRef = firebase.database().ref("sales/" + uid);

      dbSaleRef.get().then(function (snapshots) {
        let keys = [];

        if (snapshots.val() !== null) {
          keys = Object.keys(snapshots.val());
        } else {
          const loadingSaleItems = [
            document.getElementById("cards-sold"),
            document.getElementById("amount-earned"),
          ];

          for (const loadingItem of loadingSaleItems) {
            if (loadingItem !== null) {
              loadingItem.innerHTML = "0";
            }
          }

          return;
        }

        const cardsSold = keys.length ?? 0;
        let amountEarned = 0;

        for (let i = 0; i < keys.length; i++) {
          const sale = snapshots.val()[keys[i]];

          if (sale !== undefined && sale !== null) {
            amountEarned += parseInt(sale.balance);
          }
        }

        const cardsSoldHtml = document.getElementById("cards-sold");
        const amountEarnedHtml = document.getElementById("amount-earned");

        if (cardsSoldHtml !== null && amountEarnedHtml !== null) {
          cardsSoldHtml.innerHTML = cardsSold;
          amountEarnedHtml.innerHTML = "₹" + amountEarned;
        }
      });
    });
  }

  const userEmail = sessionStorage.getItem("email");
  const accountHtml = document.getElementById("navbarDropdown");

  if (accountHtml !== null) {
    accountHtml.innerHTML = userEmail;
  }
});

// Regular functions

function confirmDelete(giftCardId) {
  const giftCardPrice = parseInt(giftCardId.replace("-inr-card", ""));
  const response = window.confirm(
    "Careful!\nClick OK if you're sure you'd like to remove your " +
      giftCardPrice +
      " INR Card from your shopping cart."
  );

  if (response) {
    removeFromShoppingCart(giftCardId);
  } else {
    // Clicked cancel, popup should close
  }
}

// Deletes this gift card from the shopping cart and reduces the total
function removeFromShoppingCart(giftCardId) {
  const shoppingCartHtml = document.getElementById("shopping-cart-list");

  // Set this new amount to the gift card
  if (shoppingCartHtml !== null) {
    const giftCardHtml = document.getElementById(giftCardId);
    const giftCardQuantityHtml = document.getElementById(
      giftCardId + "-quantity"
    );

    if (giftCardHtml !== null && giftCardQuantityHtml !== null) {
      const quantity = parseInt(
        giftCardQuantityHtml.innerHTML.replace("Quantity: ", "")
      );

      // Quantity is negative so we can subtract from the total
      updateTotal(giftCardId, -1 * quantity);
      shoppingCartHtml.removeChild(giftCardHtml);
    }
  }
}

// Adds more of this gift card to the shopping cart
function addToShoppingCart(giftCardId) {
  const inputValue = document.getElementById("gift-card-quantity");

  const additionalAmt = parseInt(inputValue.value ?? "");
  const shoppingCartList = document.getElementById("shopping-cart-list");

  // Code safety to make sure we have a shopping cart and amount of cards to add
  if (shoppingCartList !== null && additionalAmt !== null) {
    const giftCard = document.getElementById(giftCardId);

    // Place it in the shopping cart if it doesn't exist
    if (giftCard === null) {
      placeCardHtmlInShoppingCart(giftCardId, shoppingCartList, additionalAmt);
      updateTotal(giftCardId, additionalAmt, 0);
    }
    // Add to the quantity of this gift card that already exists in the shopping cart
    else {
      const currentAmtHtml = document.getElementById(giftCardId + "-quantity");

      if (currentAmtHtml !== null) {
        const currentAmt = parseInt(
          currentAmtHtml.innerHTML.replace("Quantity: ", "")
        );

        currentAmtHtml.innerText = "Quantity: " + (currentAmt + additionalAmt);
        updateTotal(giftCardId, additionalAmt);
      }
    }
  }
}

// Add up the total from the gift cards in the shopping cart
function updateTotal(giftCardId, newAmt) {
  const giftCardPrice = parseInt(giftCardId.replace("-inr-card", ""));
  const total = document.getElementById("cart-total");

  if (total !== null) {
    const currentTotal = parseInt(total.innerHTML.replace("Total: ₹", ""));
    const newTotal = currentTotal + giftCardPrice * newAmt;

    total.innerHTML = "Total: ₹" + (newTotal > 0 ? newTotal : 0);

    // Disable the checkout button if total is 0
    const checkoutButtonHtml = document.getElementById("checkout-button");

    if (checkoutButtonHtml !== null) {
      if (newTotal <= 0) {
        checkoutButtonHtml.classList.add("disabled");
      }
    }
  }
}

// Helper function to insert gift card into the shopping cart
function placeCardHtmlInShoppingCart(giftCardId, shoppingCartList, quantity) {
  const cardPrice = parseInt(giftCardId.replace("-inr-card", ""));

  // Create the HTML for the new gift card and add it to the shopping cart list
  const newGiftCard = createGiftCardHtml(
    `<img src="../assets/cards/${cardPrice} INR Card.png" class="gift-card-mini" /><p id="${
      giftCardId + "-quantity"
    }">Quantity: ${quantity}</p><button id="discard-${giftCardId}" class="btn-sm btn-primary text-uppercase"">Discard</button>`,
    giftCardId
  );

  shoppingCartList.appendChild(newGiftCard);
}

// Helper function to create HTML code for the gift card
function createGiftCardHtml(htmlStr, giftCardId) {
  const inputHtml = document.createElement("div");

  inputHtml.setAttribute("class", "cart-item");
  inputHtml.setAttribute("id", giftCardId);
  inputHtml.innerHTML = htmlStr;

  return inputHtml;
}

// Helper function to create HTML code for an order
function createOrderHtml(htmlStr) {
  const inputHtml = document.createElement("tr");
  inputHtml.innerHTML = htmlStr;
  return inputHtml;
}

// Generate a random date within two years from now
function randomDateWithinTwoYearsAfter(date1) {
  let date2 = new Date(date1);
  date2.setFullYear(date1.getFullYear() + 2);

  date1 = new Date(date1).getTime();
  date2 = new Date(date2).getTime();

  if (date1 > date2) {
    return new Date(randomValueBetweenMinAndMax(date2, date1))
      .toISOString()
      .split("T")[0];
  } else {
    return new Date(randomValueBetweenMinAndMax(date1, date2))
      .toISOString()
      .split("T")[0];
  }
}

// Returns a random number between min and max
function randomValueBetweenMinAndMax(min, max) {
  return Math.random() * (max - min) + min;
}

// Removes all child elements from a parent element
function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

// Database functions
async function createNewAccount() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userAuth = await firebase
      .auth()
      .createUserWithEmailAndPassword(email, password);

    const user = {
      uid: userAuth.user.uid,
      email: userAuth.user.email,
    };

    await firebase
      .database()
      .ref("users/" + user.uid)
      .set(user);
    alert("Signup successful!");
    sessionStorage.setItem("uid", userAuth.user.uid);
    sessionStorage.setItem("email", userAuth.user.email);
    window.location.assign("../pages/dashboard.html");
  } catch (error) {
    console.log(error);
    alert(error.message);
  }
}

async function loginWithCredentials() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userAuth = await firebase
      .auth()
      .signInWithEmailAndPassword(email, password);
    alert("Login successful!");
    sessionStorage.setItem("uid", userAuth.user.uid);
    sessionStorage.setItem("email", userAuth.user.email);
    window.location.assign("../pages/dashboard.html");
  } catch (error) {
    console.log(error);
    alert(error.message);
  }
}
