class User < ApplicationRecord
  validates :images,
            attached: true,
            content_type: ['image/png','image/gif','image/jpeg'],
            size: { less_than: 5.megabytes, message: "must not exceed 5 MB" }

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable, :confirmable,
         :recoverable, :rememberable, :validatable

  has_one :payment
  accepts_nested_attributes_for :payment

  has_many_attached :images

  def full_name
    return email
  end
end
