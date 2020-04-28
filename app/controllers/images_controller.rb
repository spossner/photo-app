class ImagesController < ApplicationController
  def new
  end

  def show
    @image = current_user.images.attachments.find(params[:id])
  end

  def index
  end

  def create
    current_user.images.attach(params[:image])
    redirect_to images_path
  end

  def update
  end

  def destroy
  end
end
