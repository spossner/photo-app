Rails.application.routes.draw do
  devise_for :users, controllers: { registrations: "registrations" }
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
  root 'welcome#index'

  get 'stripe-key', to: "payment#stripe_key"
  post 'pay', to: "payment#pay"
end
