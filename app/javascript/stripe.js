// see https://github.com/stripe-samples/accept-a-card-payment
$(document).ready(function() {
    // Disable the button until we have Stripe set up on the page
    // document.querySelector("input[type='submit']").disabled = true;

    var orderData = {
        product_id: 1,
    };

    fetch("/stripe-key")
        .then(function(result) {
            return result.json();
        })
        .then(function(data) {
            return setupElements(data);
        })
        .then(function({ stripe, card, clientSecret }) {
            var form = document.getElementById("new_user");
            form.addEventListener("submit", function(event) {
                event.preventDefault();
                pay(stripe, card, clientSecret);
            });

            // Enable  the button until we have Stripe set up on the page
            document.querySelector("input[type='submit']").disabled = false;
        });

    var setupElements = function(data) {
        stripe = Stripe(data.publishableKey);
        /* ------- Set up Stripe Elements to use in checkout form ------- */
        var elements = stripe.elements();
        /*var style = {
            base: {
                color: "#32325d",
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSmoothing: "antialiased",
                fontSize: "16px",
                "::placeholder": {
                    color: "#aab7c4"
                }
            },
            invalid: {
                color: "#fa755a",
                iconColor: "#fa755a"
            }
        };*/

        // var card = elements.create("card", { style: style });
        var card = elements.create("card");
        card.mount("#card-element");

        return {
            stripe: stripe,
            card: card,
            clientSecret: data.clientSecret
        };
    };

    /*
 * Collect card details and pay for the order
 */
    var pay = function(stripe, card) {
        // changeLoadingState(true);

        // Collects card details and creates a PaymentMethod
        stripe
            .createPaymentMethod("card", card)
            .then(function(result) {
                if (result.error) {
                    showError(result.error.message);
                } else {
                    orderData.paymentMethodId = result.paymentMethod.id;

                    return fetch("/pay", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(orderData)
                    });
                }
            })
            .then(function(result) {
                return result.json();
            })
            .then(function(response) {
                if (response.error) {
                    showError(response.error);
                } else if (response.requiresAction) {
                    // Request authentication
                    handleAction(response.clientSecret);
                } else {
                    orderComplete(response.clientSecret);
                }
            });
    };

    /* ------- Post-payment helpers ------- */

    /* Shows a success / error message when the payment is complete */
    var orderComplete = function(clientSecret) {
        stripe.retrievePaymentIntent(clientSecret)
            .then(function(result) {
                var form = $("#new_user");
                var paymentIntent = result.paymentIntent;
                var paymentIntentJson = JSON.stringify(paymentIntent, null, 2);

                $("<input>").attr({
                    name: "payment[payment_method_id]",
                    type: "hidden",
                    value: paymentIntent.payment_method
                }).appendTo(form);

                $("<input>").attr({
                    name: "payment[product_id]",
                    type: "hidden",
                    value: 1
                }).appendTo(form);

                /*
                document.querySelector(".sr-payment-form").classList.add("hidden");
                document.querySelector("pre").textContent = paymentIntentJson;

                document.querySelector(".sr-result").classList.remove("hidden");
                setTimeout(function() {
                    document.querySelector(".sr-result").classList.add("expand");
                }, 200);
*/
                // changeLoadingState(false);
                form.submit();
            });
    };

    var showError = function(errorMsgText) {
        // changeLoadingState(false);
        var errorMsg = document.querySelector(".sr-field-error");
        errorMsg.textContent = errorMsgText;
        setTimeout(function() {
            errorMsg.textContent = "";
        }, 4000);
    };
});
