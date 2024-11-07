let fileInput = document.getElementById("file");
const canvas = document.getElementById("canvas");
let pngData;
let ctx = canvas.getContext("2d");
let img = document.getElementById("img");
let img1 = new Image();
let fileName = "";
let width = 800;
let height = 600;
canvas.width = width;
canvas.height = height;

fileInput.addEventListener("change", (event) => {
  let file = event.target.files[0];
  let CfileName = file.name.split(".")[1] + "\0";
  let fileNameBytes = Uint8Array.from(
    Array.from(CfileName).map((char) => char.charCodeAt(0))
  );
  if (file.name.split(".").length !== 2) {
    console.log("file doesn't have an extension");
    return;
  }
  console.log(fileName, fileNameBytes);
  if (file) {
    fileName = file.name.split(".")[1];
    if (fileName.replaceAll("\0", "") != "png") {
      let reader = new FileReader();
      reader.onload = function (e) {
        result = e.target.result;
        let resultBytes = new Uint8ClampedArray(result);
        let dataSize = new Uint32Array([resultBytes.length]);
        dataSize = new Uint8ClampedArray(dataSize.buffer);
        console.log(dataSize);
        let length = Math.floor(
          (width * height * 4) / (resultBytes.length + CfileName.length + 4)
        );
        let resultBytesWidthExt = new Uint8ClampedArray(
          resultBytes.length + CfileName.length + 4
        );
        resultBytesWidthExt.set(fileNameBytes, 0);
        resultBytesWidthExt.set(dataSize, fileNameBytes.length);
        resultBytesWidthExt.set(resultBytes, fileNameBytes.length + 4);
        let a = Uint8ClampedArray.from(
          new Uint8Array(resultBytesWidthExt.buffer, fileNameBytes.length, 4)
        );
        console.log(new Uint32Array(a.buffer), resultBytes.length);
        console.log(a);
        let newDtaArr = new Uint8ClampedArray(
          resultBytesWidthExt.length * length
        );
        newDtaArr.set(resultBytesWidthExt, 0);
        for (let i = 0; i < length - 1; i++) {
          newDtaArr.set(
            resultBytesWidthExt,
            resultBytesWidthExt.length + resultBytesWidthExt.length * i
          );
        }
        console.log(newDtaArr, fileNameBytes);
        console.log(e.target);
        createCanvas(newDtaArr);
        document.getElementById("dwn").onclick = () => {
          // Create a Blob and download link
          const blob = new Blob([pngData], { type: "image/png" });
          const url = URL.createObjectURL(blob);
          // Trigger download
          const link = document.createElement("a");
          link.href = url;
          link.download = "output.png";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        };
      };
      reader.onerror = function (e) {
        console.log("Error : " + e.type);
      };
      console.log(file);
      reader.readAsArrayBuffer(file);
    } else {
      let reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target.result;
        const bytes = new Uint8ClampedArray(result);
        console.log(result);
        let img = UPNG.decode(result);
        let imageBytes = new Uint8ClampedArray(UPNG.toRGBA8(img)[0]);
        let extLen = str_len(imageBytes, 0) + 1;
        let dataBufferSize = Uint8ClampedArray.from(
          new Uint8ClampedArray(imageBytes.buffer, extLen, 4)
        );
        let extensionString = get_str(0, imageBytes.buffer);
        let fileDataBuffer = new Uint8ClampedArray(
          imageBytes.buffer,
          extLen + 4,
          new Uint32Array(dataBufferSize.buffer)[0]
        );
        console.log(extLen, extensionString);
        if (extensionString == "txt") {
          let text = new TextDecoder().decode(fileDataBuffer);
          let textArea = document.getElementById("text");
          // ctx.font = "2rem 'Courier New'";
          // ctx.fillText(text, 0, 25, width - 16 * 2);
          canvas.style.display = "none";
          textArea.style.display = "block";
          textArea.style.width = 800 + "px";
          textArea.style.height = 600 + "px";
          textArea.value = text;
        } else {
          let imageData = new ImageData(imageBytes, width, height);
          ctx.putImageData(imageData, 0, 0);
        }
        document.getElementById("dwn").onclick = () => {
          var blob = new Blob([new Uint8Array(fileDataBuffer)]);
          const url = URL.createObjectURL(blob);

          // Trigger download
          const link = document.createElement("a");
          link.href = url;
          link.download = "output." + extensionString;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        };
      };
      reader.readAsArrayBuffer(file);
    }
  }
});
// console.log(fileAsData);
const createCanvas = (fileData) => {
  let bytes = new Uint8ClampedArray(width * height * 4);
  console.log(bytes);
  for (let i = 0; i < bytes.length; i++) {
    if (i < fileData.length) {
      bytes[i] = fileData[i];
    } else {
      bytes[i] = 50;
    }
  }
  pngData = UPNG.encode([bytes.buffer], width, height, 0);
  // let img = UPNG.decode(pngData);
  // let imageBytes = new Uint8ClampedArray(UPNG.toRGBA8(img)[0]);
  let imageData = new ImageData(bytes, width, height);
  console.log(imageData);
  // let imageData = new ImageData(pngData, width, height);
  ctx.putImageData(imageData, 0, 0);
  // Encode as PNG using UPNG
};

const str_len = (mem, str_ptr) => {
  let len = 0;
  while (mem[str_ptr] != 0) {
    len++;
    str_ptr++;
  }
  return len;
};
const get_str = (str_ptr, buffer) => {
  const mem = new Uint8Array(buffer);
  const len = str_len(mem, str_ptr);
  const str_bytes = new Uint8Array(buffer, str_ptr, len);
  return new TextDecoder().decode(str_bytes);
};
