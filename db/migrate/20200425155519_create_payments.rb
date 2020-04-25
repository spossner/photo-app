class CreatePayments < ActiveRecord::Migration[6.0]
  def change
    create_table :payments do |t|
      t.integer :user_id
      t.string :payment_method_id
      t.integer :product_id

      t.timestamps
    end
  end
end
