/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      backgroundImage: {
        "radial-glow":
          "radial-gradient(circle at 80% 70%, #0FCAD2,  #015364, #015364)",
        "radial-glow-bottom":
          "radial-gradient(ellipse at 20% 150%, #0FCAD2, #015364, #015364)",
      },
      colors: {
        mainText: "#17252A",
        subText: "#455A64",
        primaryColor: "#0F969C",
        darkPrimaryColor: "#015364",
        borderGreyColor: "#DADADA",
        greyColor: "#72777A",
        warningColor: "#B26B00",
        urgentColor: "#D32F2F",
      },
      // NOTE: these keys must exactly match the font names registered via
      // useFonts() in app/_layout.tsx, or NativeWind will silently fall back
      // to the OS default font.
      fontFamily: {
        sans: "Inter_400Regular",
        "sans-medium": "Inter_500Medium",
        "sans-semibold": "Inter_600SemiBold",
        "sans-bold": "Inter_700Bold",
        display: "Montserrat_400Regular",
        "display-medium": "Montserrat_500Medium",
        "display-semibold": "Montserrat_600SemiBold",
        "display-bold": "Montserrat_700Bold",
      },
    },
  },
  plugins: [],
};
