const fileInput = document.getElementById("file");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const textArea = document.getElementById("text");
let pngData;
let fileExt = "";
let width = 800;
let height = 600;
canvas.width = width;
canvas.height = height;
textArea.style.width = width + "px";
textArea.style.height = height + "px";

fileInput.addEventListener("change", (event) => {
  // get file from input
  let file = event.target.files[0];

  // get file extension from file name
  let CfileExt = file.name.split(".")[1] + "\0";

  // creat and Uint8array from file ext html => [104, 116, 109, 108, 0]
  let fileExtBytes = Uint8Array.from(
    Array.from(CfileExt).map((char) => char.charCodeAt(0))
  );

  //if file has no extension return
  if (file.name.split(".").length !== 2) {
    console.log("file doesn't have an extension");
    return;
  }
  console.log(fileExt, fileExtBytes);

  // if file not null
  if (file) {
    fileExt = file.name.split(".")[1];
    // extension is .png
    if (fileExt.replaceAll("\0", "") != "png") {
      // new file reader
      let reader = new FileReader();

      // reader loaded successfully
      reader.onload = function (e) {
        result = e.target.result;
        let resultBytes = new Uint8ClampedArray(result);
        let dataSize = new Uint32Array([resultBytes.length]);
        dataSize = new Uint8ClampedArray(dataSize.buffer);
        console.log(dataSize);
        let length = Math.floor(
          (width * height * 4) / (resultBytes.length + CfileExt.length + 4)
        );
        let resultBytesWidthExt = new Uint8ClampedArray(
          resultBytes.length + CfileExt.length + 4
        );
        resultBytesWidthExt.set(fileExtBytes, 0);
        resultBytesWidthExt.set(dataSize, fileExtBytes.length);
        resultBytesWidthExt.set(resultBytes, fileExtBytes.length + 4);
        let a = Uint8ClampedArray.from(
          new Uint8Array(resultBytesWidthExt.buffer, fileExtBytes.length, 4)
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

        // console.log(newDtaArr, fileExtBytes);
        // console.log(e.target);
        createCanvas(newDtaArr);

        // download file when clicking on download button
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

      // reader when error
      reader.onerror = function (e) {
        console.log("Error : " + e.type);
      };

      // read file
      reader.readAsArrayBuffer(file);
      //
    } else {
      // extension is not .png
      let reader = new FileReader();

      // on reader load successfully
      reader.onload = (e) => {
        const result = e.target.result;
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
          canvas.style.display = "none";
          textArea.style.display = "block";
          textArea.value = text;
        } else {
          // TODO draw everything related to the canvas with createCanvas function
          canvas.style.display = "block";
          textArea.style.display = "none";
          let imageData = new ImageData(imageBytes, width, height);
          ctx.putImageData(imageData, 0, 0);
        }

        // Download button onclick
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

      // reader when error
      reader.onerror = function (e) {
        console.log("Error : " + e.type);
      };

      // read file
      reader.readAsArrayBuffer(file);
    }
  }
});

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
  // Encode as PNG using UPNG
  pngData = UPNG.encode([bytes.buffer], width, height, 0);
  let imageData = new ImageData(bytes, width, height);
  // textArea.style.display = "none";
  // textArea.value = "";
  canvas.style.display = "block";
  ctx.putImageData(imageData, 0, 0);
};

// get string length from memory
const str_len = (mem, str_ptr) => {
  let len = 0;
  // check if we get to "\0" or 0 byte Cstring(char*) style
  while (mem[str_ptr] != 0) {
    len++;
    str_ptr++;
  }
  return len;
};

// get string from memory
const get_str = (str_ptr, buffer) => {
  const mem = new Uint8Array(buffer);
  const len = str_len(mem, str_ptr);
  // extract string bytes from mmemory buffer
  const str_bytes = new Uint8Array(buffer, str_ptr, len);
  // return string decoded from bytes
  return new TextDecoder().decode(str_bytes);
};
