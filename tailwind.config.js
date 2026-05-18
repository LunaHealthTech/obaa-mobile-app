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
        borderGreyColor: "#DADADA",
        greyColor: "#72777A",
      },
    },
  },
  plugins: [],
};
