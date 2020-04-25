require 'stripe'

class PaymentController < ApplicationController
  skip_before_action :authenticate_user!, only: [:stripe_key, :pay]
  skip_before_action :verify_authenticity_token

  def stripe_key
    render json: { publishableKey: Rails.configuration.stripe[:publishable_key] }
  end

  def pay
    data = JSON.parse(request.body.read)
    begin
      if data['paymentMethodId']
        # Create a PaymentIntent with a PaymentMethod ID from the client.
        intent = Stripe::PaymentIntent.create(
            amount: 1000,
            currency: 'eur',
            payment_method: data['paymentMethodId'],
            confirmation_method: 'manual',
            confirm: true,
            use_stripe_sdk: data['useStripeSdk']
        )
      elsif data['paymentIntentId']
        intent = Stripe::PaymentIntent.confirm data['paymentIntentId']
      end
      render json: generate_response(intent)
    rescue Stripe::CardError => e
      render json: { error: e.message }
    end
  end

  def generate_response(intent)
    case intent['status']
    when 'requires_action', 'requires_source_action'
      # Card requires authentication
      return {
          requiresAction: true,
          paymentIntentId: intent['id'],
          clientSecret: intent['client_secret']
      }
    when 'requires_payment_method', 'requires_source'
      # Card was not properly authenticated, new payment method required
      return {
          error: 'Your card was denied, please provide a new payment method'
      }
    when 'succeeded'
      # Payment is complete, authentication not required
      # To cancel the payment you will need to issue a Refund (https://stripe.com/docs/api/refunds)
      puts '💰 Payment received!'
      return {
          clientSecret: intent['client_secret']
      }
    end
  end
end
