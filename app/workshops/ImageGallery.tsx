"use client"
import Carousel from "@/components/Carousel"

const ImageGallery = () => {
  return (
    <div className="w-full h-[1364 px] flex-centre flex-col overflow-clip gap-20">
      <h2 className="workshop-heading">Gallery</h2>
      <div className="w-full flex-centre flex-col overflow-clip gap-10">
        <Carousel/>
        <Carousel/>
      </div>
    </div>
  )
}

export default ImageGallery
