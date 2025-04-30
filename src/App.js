import "./App.css";
import { Cloudinary } from "@cloudinary/url-gen";
import { auto } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";
import { AdvancedImage } from "@cloudinary/react";

function App() {
  const apiKey = process.env.REACT_APP_AMPLI_API_KEY;

  const cld = new Cloudinary({ cloud: { cloudName: "dwi8mo6ev" } });

  // Use this sample image or upload your own via the Media Explorer
  const img = cld
    .image("IMG_4300_gkzshq")
    .format("auto") // Optimize delivery by resizing and applying auto-format and auto-quality
    .quality("auto")
    .resize(auto().gravity(autoGravity()).width(500).height(500)); // Transform the image: auto-crop to square aspect_ratio

  return (
    <div className="App">
      <h1> My Amplitude GTM test App</h1>
      <div>
        <button> Click Me</button>
      </div>
      <div>
        <AdvancedImage cldImg={img} />
      </div>
    </div>
  );
}

export default App;
