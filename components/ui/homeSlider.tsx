import React from "react";
import { View, Image, Dimensions } from "react-native";
import Swiper from "react-native-swiper";

const { width } = Dimensions.get("window");

export default function ImageSlider() {
  return (
    <View style={{height:50}}>
      <Swiper autoplay showsPagination>
        <Image
          source={require("../../assets/images/banner1.jpg")}
          style={{ width: width, height: 50 }}
        />
        <Image
          source={require("../../assets/images/banner2.png")}
          style={{ width: width, height: 50 }}
        />
        <Image
          source={require("../../assets/images/banner3.png")}
          style={{ width: width, height: 50 }}
        />
      </Swiper>
    </View>
  );
}


