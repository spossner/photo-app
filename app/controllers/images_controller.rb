class ImagesController < ApplicationController
  before_action :find_image_by_id, only: [:show, :edit, :update, :destroy]

  def new
  end

  def show
  end

  def index
    @images = current_user.images.reverse
  end

  def create
    current_user.images.attach(params[:image])
    if current_user.errors.any?
      render :new
    else
      redirect_to images_path
    end

  end

  def update
  end

  def destroy
    if @image.destroy
      flash[:alert] = "#{@image.blob.filename} successfully deleted"
    end
    redirect_to images_path
  end

  private
  def find_image_by_id
    @image = current_user.images.attachments.find(params[:id])
  end
end
