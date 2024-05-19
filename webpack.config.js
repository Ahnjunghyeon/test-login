module.exports = {
  // 기존 웹팩 설정 내용을 여기에 추가할 수 있습니다.
  // Source Map Loader의 경고를 무시하려면 아래와 같이 추가합니다.
  module: {
    rules: [
      {
        test: /@react-aria\/ssr/,
        enforce: "pre",
        use: ["source-map-loader"],
      },
    ],
  },
};
